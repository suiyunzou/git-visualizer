<template>
  <div class="git-graph-container">
    <div class="graph-toolbar">
      <el-button-group>
        <el-tooltip content="创建新提交" placement="top">
          <el-button @click="createCommit" type="primary" :icon="Plus">
            提交
          </el-button>
        </el-tooltip>
        <el-tooltip content="创建新分支" placement="top">
          <el-button @click="createBranch" type="success" :icon="Share">
            分支
          </el-button>
        </el-tooltip>
        <el-tooltip content="合并分支" placement="top">
          <el-button @click="mergeBranches" type="warning" :icon="Switch">
            合并
          </el-button>
        </el-tooltip>
      </el-button-group>

      <div class="graph-controls">
        <el-tooltip content="重置视图" placement="top">
          <el-button @click="resetView" :icon="Refresh" circle></el-button>
        </el-tooltip>
        <el-tooltip content="缩放视图" placement="top">
          <el-slider
            v-model="zoom"
            :min="0.5"
            :max="2"
            :step="0.1"
            style="width: 100px"
          />
        </el-tooltip>
      </div>
    </div>

    <div class="graph-workspace" ref="workspace">
      <svg ref="svg" class="git-graph-svg">
        <g class="zoom-container">
          <g class="links"></g>
          <g class="nodes"></g>
          <g class="labels"></g>
        </g>
      </svg>

      <div v-if="selectedNode" class="node-details">
        <div class="detail-header">
          <h3>{{ getNodeTitle(selectedNode) }}</h3>
          <el-button type="text" @click="selectedNode = null" :icon="Close" />
        </div>
        <div class="detail-content">
          <template v-if="selectedNode.type === 'commit'">
            <p><strong>提交哈希：</strong> {{ selectedNode.hash }}</p>
            <p><strong>提交信息：</strong> {{ selectedNode.message }}</p>
            <p><strong>作者：</strong> {{ selectedNode.author }}</p>
            <p><strong>日期：</strong> {{ formatDate(selectedNode.date) }}</p>
            <p><strong>分支：</strong> {{ selectedNode.branch }}</p>
          </template>
          <template v-else-if="selectedNode.type === 'branch'">
            <p><strong>分支名：</strong> {{ selectedNode.name }}</p>
            <p><strong>最新提交：</strong> {{ selectedNode.latestCommit }}</p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'
import { Plus, Share, Switch, Refresh, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 状态变量
const workspace = ref(null)
const svg = ref(null)
const zoom = ref(1)
const selectedNode = ref(null)
const nodes = ref([])
const links = ref([])
const branches = ref(['main']) // 当前存在的分支
const currentBranch = ref('main') // 当前活动分支
const branchColors = {
  'main': '#4caf50',
  'feature': '#2196f3',
  'hotfix': '#f44336',
  'release': '#ff9800'
}

// D3 相关变量
let simulation = null
let zoomBehavior = null

// 初始化函数
onMounted(() => {
  initializeGraph()
  setupZoom()
  createInitialState()
})

// 监听缩放变化
watch(zoom, (newZoom) => {
  if (zoomBehavior) {
    d3.select(svg.value)
      .transition()
      .duration(300)
      .call(zoomBehavior.scaleTo, newZoom)
  }
})

// 初始化图形
function initializeGraph() {
  const width = workspace.value.clientWidth
  const height = workspace.value.clientHeight

  simulation = d3.forceSimulation(nodes.value)
    .force('link', d3.forceLink(links.value).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', updateGraph)

  // 设置SVG尺寸
  d3.select(svg.value)
    .attr('width', width)
    .attr('height', height)
}

// 设置缩放行为
function setupZoom() {
  zoomBehavior = d3.zoom()
    .scaleExtent([0.5, 2])
    .on('zoom', (event) => {
      d3.select('.zoom-container')
        .attr('transform', event.transform)
      zoom.value = event.transform.k
    })

  d3.select(svg.value).call(zoomBehavior)
}

// 创建初始状态
function createInitialState() {
  // 创建主分支和初始提交
  const initialCommit = {
    id: 'commit-1',
    type: 'commit',
    hash: 'initial',
    message: '初始提交',
    author: 'System',
    date: new Date(),
    branch: 'main'
  }
  
  const mainBranch = {
    id: 'branch-main',
    type: 'branch',
    name: 'main',
    latestCommit: initialCommit.hash,
  }

  nodes.value.push(initialCommit, mainBranch)
  links.value.push({
    source: mainBranch.id,
    target: initialCommit.id,
    branch: 'main'
  })

  updateSimulation()
}

// 更新图形
function updateGraph() {
  // 更新连接线
  const link = d3.select('.links')
    .selectAll('line')
    .data(links.value)
    .join('line')
    .attr('stroke', d => {
      const branchType = d.branch.split('/')[0]
      return d.isMergeLink ? '#9c27b0' : (branchColors[branchType] || branchColors.feature)
    })
    .attr('stroke-width', d => d.isMergeLink ? 1 : 2)
    .attr('stroke-dasharray', d => d.isMergeLink ? '5,5' : null)
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y)

  // 更新节点
  const node = d3.select('.nodes')
    .selectAll('circle')
    .data(nodes.value)
    .join('circle')
    .attr('r', d => d.type === 'commit' ? (d.isMergeCommit ? 10 : 8) : 10)
    .attr('fill', d => getNodeColor(d))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .on('click', (event, d) => selectNode(d))
    .call(drag(simulation))

  // 更新标签
  const label = d3.select('.labels')
    .selectAll('text')
    .data(nodes.value)
    .join('text')
    .text(d => getNodeLabel(d))
    .attr('x', d => d.x + 15)
    .attr('y', d => d.y + 5)
    .attr('font-size', '12px')
    .attr('fill', d => d.type === 'commit' ? getNodeColor(d) : '#666')
}

// 节点拖拽行为
function drag(simulation) {
  const dragstarted = (event) => {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  const dragged = (event) => {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  const dragended = (event) => {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }

  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
}

// 创建新提交
function createCommit() {
  const newCommit = {
    id: `commit-${Date.now()}`,
    type: 'commit',
    hash: Math.random().toString(36).substring(2, 10),
    message: '新的提交',
    author: 'User',
    date: new Date(),
    branch: currentBranch.value
  }

  // 找到当前分支的最新提交
  const latestCommit = nodes.value
    .filter(n => n.type === 'commit' && n.branch === currentBranch.value)
    .sort((a, b) => b.date - a.date)[0]

  nodes.value.push(newCommit)
  
  if (latestCommit) {
    links.value.push({
      source: newCommit.id,
      target: latestCommit.id,
      branch: currentBranch.value
    })
  }

  updateSimulation()
  ElMessage.success('创建新提交成功')
}

// 创建新分支
function createBranch() {
  // 生成分支名称，带有类型前缀
  const branchTypes = ['feature', 'hotfix', 'release']
  const randomType = branchTypes[Math.floor(Math.random() * branchTypes.length)]
  const branchName = `${randomType}/${Math.floor(Math.random() * 1000)}`
  
  if (branches.value.includes(branchName)) {
    ElMessage.warning('分支名称已存在')
    return
  }

  // 获取当前分支的最新提交作为新分支的起点
  const sourceCommit = nodes.value
    .filter(n => n.type === 'commit' && n.branch === currentBranch.value)
    .sort((a, b) => b.date - a.date)[0]

  if (!sourceCommit) {
    ElMessage.warning('需要至少一个提交才能创建分支')
    return
  }

  branches.value.push(branchName)
  currentBranch.value = branchName // 切换到新分支

  // 创建分支的第一个提交
  const branchCommit = {
    id: `commit-${Date.now()}`,
    type: 'commit',
    hash: Math.random().toString(36).substring(2, 10),
    message: `创建分支 ${branchName}`,
    author: 'User',
    date: new Date(),
    branch: branchName
  }

  nodes.value.push(branchCommit)
  links.value.push({
    source: branchCommit.id,
    target: sourceCommit.id,
    branch: branchName
  })

  updateSimulation()
  ElMessage.success(`创建并切换到分支 ${branchName}`)
}

// 合并分支
function mergeBranches() {
  if (currentBranch.value === 'main') {
    ElMessage.warning('请先切换到要合并的特性分支')
    return
  }

  // 获取当前分支的最新提交
  const sourceBranchLatestCommit = nodes.value
    .filter(n => n.type === 'commit' && n.branch === currentBranch.value)
    .sort((a, b) => b.date - a.date)[0]

  // 获取主分支的最新提交
  const mainBranchLatestCommit = nodes.value
    .filter(n => n.type === 'commit' && n.branch === 'main')
    .sort((a, b) => b.date - a.date)[0]

  if (!sourceBranchLatestCommit || !mainBranchLatestCommit) {
    ElMessage.warning('无法找到要合并的提交')
    return
  }

  // 创建合并提交
  const mergeCommit = {
    id: `commit-${Date.now()}`,
    type: 'commit',
    hash: Math.random().toString(36).substring(2, 10),
    message: `合并分支 ${currentBranch.value} 到 main`,
    author: 'User',
    date: new Date(),
    branch: 'main',
    isMergeCommit: true
  }

  nodes.value.push(mergeCommit)
  
  // 添加两个连接，表示合并
  links.value.push(
    {
      source: mergeCommit.id,
      target: mainBranchLatestCommit.id,
      branch: 'main'
    },
    {
      source: mergeCommit.id,
      target: sourceBranchLatestCommit.id,
      branch: currentBranch.value,
      isMergeLink: true
    }
  )

  // 切换回主分支
  currentBranch.value = 'main'
  
  updateSimulation()
  ElMessage.success('分支合并成功')
}

// 更新模拟器
function updateSimulation() {
  simulation.nodes(nodes.value)
  simulation.force('link').links(links.value)
  simulation.alpha(1).restart()
}

// 重置视图
function resetView() {
  d3.select(svg.value)
    .transition()
    .duration(750)
    .call(zoomBehavior.transform, d3.zoomIdentity)
}

// 选择节点
function selectNode(node) {
  selectedNode.value = node
}

// 工具函数
function getNodeColor(node) {
  if (node.type === 'commit') {
    const branchType = node.branch.split('/')[0]
    return node.isMergeCommit ? '#9c27b0' : (branchColors[branchType] || branchColors.feature)
  }
  return '#999'
}

function getNodeLabel(node) {
  switch (node.type) {
    case 'commit': return node.hash.substring(0, 7)
    case 'branch': return node.name
    default: return ''
  }
}

function getNodeTitle(node) {
  switch (node.type) {
    case 'commit': return '提交详情'
    case 'branch': return '分支详情'
    default: return '节点详情'
  }
}

function formatDate(date) {
  return new Date(date).toLocaleString()
}
</script>

<style lang="scss" scoped>
.git-graph-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--background-white);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.graph-toolbar {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--background-light);

  .graph-controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.graph-workspace {
  flex: 1;
  position: relative;
  overflow: hidden;

  .git-graph-svg {
    width: 100%;
    height: 100%;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }
}

.node-details {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  background: var(--background-white);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;

  .detail-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      color: var(--text-primary);
    }
  }

  .detail-content {
    padding: 16px;

    p {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }

    strong {
      color: var(--text-primary);
    }
  }
}
</style>
