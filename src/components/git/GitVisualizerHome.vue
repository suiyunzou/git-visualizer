<template>
  <app-layout>
    <home-hero />
    <div class="git-visualizer">
      <div class="visualization-container card">
        <div class="workspace-header">
          <h2>Git 工作区</h2>
          <div class="workspace-controls">
            <el-button-group>
              <el-button type="primary" @click="handleCommit">
                <el-icon><Plus /></el-icon>
                提交
              </el-button>
              <el-button type="success" @click="branchDialogVisible = true">
                <el-icon><Share /></el-icon>
                分支
              </el-button>
              <el-button type="warning" @click="handleMerge">
                <el-icon><Switch /></el-icon>
                合并
              </el-button>
            </el-button-group>

            <div class="branch-info">
              <span class="label">当前分支：</span>
              <el-tag :type="getBranchTagType">{{ currentBranch }}</el-tag>
            </div>
          </div>
        </div>

        <div class="workspace-container">
          <div class="git-graph" ref="graphContainer"></div>
        </div>
      </div>

      <div class="features-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="feature-card">
              <el-icon class="feature-icon"><Monitor /></el-icon>
              <h3>可视化学习</h3>
              <p>通过直观的可视化界面，轻松理解Git的工作原理和操作流程</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="feature-card">
              <el-icon class="feature-icon"><Operation /></el-icon>
              <h3>实践练习</h3>
              <p>在安全的环境中练习Git命令，掌握版本控制的精髓</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="feature-card">
              <el-icon class="feature-icon"><Reading /></el-icon>
              <h3>循序渐进</h3>
              <p>从基础到进阶，系统地学习Git的各项功能和最佳实践</p>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 创建分支对话框 -->
    <el-dialog
      v-model="branchDialogVisible"
      title="创建分支"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form :model="branchForm" label-width="100px">
        <el-form-item label="分支类型">
          <el-select v-model="branchForm.type" placeholder="请选择分支类型" style="width: 100%">
            <el-option
              v-for="item in branchTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="branchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createBranch">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </app-layout>
</template>

<script>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import * as d3 from 'd3'
import AppLayout from '../common/AppLayout.vue'
import HomeHero from '../home/HomeHero.vue'
import { Plus, Share, Switch, Monitor, Operation, Reading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'GitVisualizerHome',
  components: {
    AppLayout,
    HomeHero
  },

  setup() {
    const graphContainer = ref(null)
    const currentBranch = ref('main')
    const nodes = ref([])
    const links = ref([])
    const svg = ref(null)
    const simulation = ref(null)

    // 分支对话框相关
    const branchDialogVisible = ref(false)
    const branchForm = ref({
      type: 'feature'
    })
    const branchTypes = [
      {
        label: '特性分支 (feature)',
        value: 'feature'
      },
      {
        label: '热修复分支 (hotfix)',
        value: 'hotfix'
      },
      {
        label: '发布分支 (release)',
        value: 'release'
      }
    ]

    // 初始化图形
    const initGraph = () => {
      const width = graphContainer.value.clientWidth
      const height = 600

      // 清除已有的 SVG
      d3.select(graphContainer.value).selectAll('svg').remove()
      
      svg.value = d3.select(graphContainer.value)
        .append('svg')
        .attr('width', width)
        .attr('height', height)

      // 初始化节点
      const initialCommit = {
        id: 'initial',
        type: 'commit',
        message: '初始提交',
        branch: 'main'
      }
      nodes.value = [initialCommit]
      links.value = []

      // 设置力导向图
      simulation.value = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30))

      // 初次更新图形
      updateGraph()
    }

    // 获取分支颜色
    const getBranchColor = (branch) => {
      const colors = {
        main: '#e69d00',     // Git 默认主分支颜色（橙色）
        master: '#e69d00',   // 兼容 master 分支
        feature: '#4b80f0',  // 特性分支（蓝色）
        hotfix: '#dc3545',   // 热修复分支（红色）
        release: '#28a745'   // 发布分支（绿色）
      }
      return colors[branch.split('/')[0]] || colors.feature
    }

    // 获取节点标签文本
    const getNodeLabel = (node) => {
      if (node.type === 'merge') {
        return 'merge'
      }
      if (node.type === 'commit') {
        if (node.message.includes('初始提交')) {
          return 'main'
        }
        if (node.message.includes('创建分支')) {
          return node.branch
        }
        const shortId = node.id.split('-')[1]?.slice(0, 7)
        return shortId ? `#${shortId}` : ''
      }
      return node.branch
    }

    // 分支标签类型
    const getBranchTagType = computed(() => {
      const types = {
        main: 'warning',    // 主分支使用橙色
        master: 'warning',  // 兼容 master 分支
        feature: 'primary', // 特性分支使用蓝色
        hotfix: 'danger',   // 热修复分支使用红色
        release: 'success'  // 发布分支使用绿色
      }
      return types[currentBranch.value.split('/')[0]] || 'info'
    })

    // 获取分支类型名称
    const getBranchTypeName = (type) => {
      const types = {
        main: '主分支',
        master: '主分支',
        feature: '特性分支',
        hotfix: '热修复分支',
        release: '发布分支'
      }
      return types[type] || '特性分支'
    }

    // 更新图形
    const updateGraph = () => {
      if (!svg.value || !simulation.value) return

      // 更新力导向图数据
      simulation.value.nodes(nodes.value)
      const linkForce = simulation.value.force('link')
      linkForce.links(links.value)

      // 更新连线
      const link = svg.value.selectAll('.link')
        .data(links.value)
        .join(
          enter => enter.append('line')
            .attr('class', 'link')
            .attr('stroke', '#999')
            .attr('stroke-width', 2)
            .attr('data-type', d => d.type || 'normal'),
          update => update,
          exit => exit.remove()
        )

      // 更新节点
      const nodeGroup = svg.value.selectAll('.node-group')
        .data(nodes.value)
        .join(
          enter => {
            const group = enter.append('g')
              .attr('class', 'node-group')
            
            // 添加节点圆圈
            group.append('circle')
              .attr('class', 'node')
              .attr('r', d => d.type === 'merge' ? 7 : 5)
              .attr('fill', d => getBranchColor(d.branch))
            
            // 添加文本标签
            group.append('text')
              .attr('class', 'node-label')
              .attr('dx', 8)
              .attr('dy', 4)
              .text(d => getNodeLabel(d))
              .attr('fill', d => getBranchColor(d.branch))
            
            return group
          },
          update => {
            update.select('circle')
              .attr('r', d => d.type === 'merge' ? 7 : 5)
              .attr('fill', d => getBranchColor(d.branch))
            update.select('text')
              .text(d => getNodeLabel(d))
              .attr('fill', d => getBranchColor(d.branch))
            return update
          },
          exit => exit.remove()
        )

      // 更新位置
      simulation.value.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)

        nodeGroup
          .attr('transform', d => `translate(${d.x},${d.y})`)
      })

      // 重新启动模拟
      simulation.value.alpha(1).restart()
    }

    // 处理提交
    const handleCommit = () => {
      const newCommit = {
        id: `commit-${Date.now()}`,
        type: 'commit',
        message: '提交变更',
        branch: currentBranch.value
      }

      const parentCommit = nodes.value[nodes.value.length - 1]
      nodes.value.push(newCommit)
      links.value.push({
        source: parentCommit.id,
        target: newCommit.id
      })

      // 更新图形
      updateGraph()
      ElMessage.success('创建提交成功')
    }

    // 处理创建分支
    const createBranch = () => {
      const branchNumber = Math.floor(Math.random() * 1000)
      const newBranch = `${branchForm.value.type}/${branchNumber}`
      currentBranch.value = newBranch

      const parentCommit = nodes.value[nodes.value.length - 1]
      const branchCommit = {
        id: `commit-${Date.now()}`,
        type: 'commit',
        message: `创建分支 ${newBranch}`,
        branch: newBranch
      }

      nodes.value.push(branchCommit)
      links.value.push({
        source: parentCommit.id,
        target: branchCommit.id
      })

      // 更新图形
      updateGraph()
      branchDialogVisible.value = false
      ElMessage.success(`创建${getBranchTypeName(branchForm.value.type)} ${newBranch} 成功`)
    }

    // 处理合并
    const handleMerge = () => {
      if (currentBranch.value === 'main') {
        ElMessage.warning('当前已经在主分支上')
        return
      }

      // 找到主分支的最新提交
      const mainCommit = nodes.value.filter(n => n.branch === 'main').pop()
      if (!mainCommit) {
        ElMessage.error('未找到主分支')
        return
      }

      // 找到当前分支的最新提交
      const currentCommit = nodes.value.filter(n => n.branch === currentBranch.value).pop()
      if (!currentCommit) {
        ElMessage.error('未找到当前分支的提交')
        return
      }

      // 创建合并提交
      const mergeCommit = {
        id: `merge-${Date.now()}`,
        type: 'merge',
        message: `将 ${currentBranch.value} 合并到 main`,
        branch: 'main'
      }

      nodes.value.push(mergeCommit)
      
      // 添加从当前分支到合并提交的连线
      links.value.push({
        source: currentCommit.id,
        target: mergeCommit.id,
        type: 'merge'
      })

      // 添加从主分支到合并提交的连线
      links.value.push({
        source: mainCommit.id,
        target: mergeCommit.id
      })

      // 切换回主分支
      currentBranch.value = 'main'
      
      // 更新图形
      updateGraph()
      ElMessage.success(`已将 ${currentBranch.value} 合并到主分支`)
    }

    onMounted(() => {
      initGraph()

      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        if (graphContainer.value) {
          initGraph()
        }
      })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', initGraph)
    })

    return {
      graphContainer,
      currentBranch,
      getBranchTagType,
      handleCommit,
      handleMerge,
      branchDialogVisible,
      branchForm,
      branchTypes,
      createBranch
    }
  }
}
</script>

<style lang="scss" scoped>
.git-visualizer {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.visualization-container {
  margin-bottom: 40px;

  .workspace-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: var(--text-primary);
    }

    .workspace-controls {
      display: flex;
      align-items: center;
      gap: 20px;

      .branch-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .label {
          color: var(--text-secondary);
        }
      }
    }
  }

  .workspace-container {
    height: 600px;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    overflow: hidden;

    .git-graph {
      width: 100%;
      height: 100%;

      :deep(svg) {
        .link {
          stroke-opacity: 0.6;
          
          &[data-type="merge"] {
            stroke-dasharray: 5,5;
          }
        }

        .node-group {
          cursor: pointer;

          .node {
            transition: r 0.3s ease;
          }

          &:hover {
            .node {
              r: 8;
            }
          }

          .node-label {
            font-size: 12px;
            font-family: monospace;
            pointer-events: none;
            user-select: none;
          }
        }
      }
    }
  }
}

.features-section {
  .feature-card {
    background: var(--background-white);
    padding: 24px;
    border-radius: var(--border-radius);
    text-align: center;
    height: 100%;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .feature-icon {
      font-size: 48px;
      color: var(--primary-color);
      margin-bottom: 16px;
    }

    h3 {
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    p {
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.6;
    }
  }
}

@media (max-width: 768px) {
  .workspace-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start !important;
  }

  .features-section {
    .el-col {
      margin-bottom: 20px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
