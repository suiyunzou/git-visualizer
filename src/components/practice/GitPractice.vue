<template>
  <app-layout>
    <div class="git-practice">
      <h1>Git 命令实践</h1>
      <p class="description">在这里你可以安全地练习 Git 命令，所有操作都在模拟环境中进行</p>

      <div class="practice-container">
        <div class="terminal-section">
          <div class="terminal">
            <div class="terminal-header">
              <div class="terminal-buttons">
                <span class="close"></span>
                <span class="minimize"></span>
                <span class="maximize"></span>
              </div>
              <span class="terminal-title">Git Bash</span>
            </div>
            <div class="terminal-body" ref="terminalBody" @click="focusInput">
              <div v-for="(line, index) in terminalOutput" :key="index" class="terminal-line">
                <span v-if="line.type === 'command'" class="prompt">{{ getPrompt() }}</span>
                <span :class="line.type">{{ line.content }}</span>
              </div>
              <div class="terminal-input-line">
                <span class="prompt">{{ getPrompt() }}</span>
                <input 
                  ref="commandInput"
                  v-model="currentCommand"
                  @keyup.enter="executeCommand"
                  @keyup.up="showPreviousCommand"
                  @keyup.down="showNextCommand"
                  placeholder="输入 Git 命令..."
                  :disabled="isProcessing"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="visualization-section">
          <h3>Git 状态可视化</h3>
          <div class="git-status">
            <div class="status-item" :class="{ active: gitState.isInitialized }">
              <el-icon><FolderOpened /></el-icon>
              <span>Git 仓库</span>
            </div>
            <div class="status-item" :class="{ active: gitState.hasChanges }">
              <el-icon><Files /></el-icon>
              <span>工作区更改</span>
            </div>
            <div class="status-item" :class="{ active: gitState.hasStagedChanges }">
              <el-icon><Plus /></el-icon>
              <span>暂存区</span>
            </div>
            <div class="status-item" :class="{ active: gitState.hasCommits }">
              <el-icon><Box /></el-icon>
              <span>提交历史</span>
            </div>
          </div>

          <div class="file-tree" v-if="gitState.isInitialized">
            <h4>文件结构</h4>
            <el-tree :data="fileTree" :props="defaultProps" />
          </div>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { FolderOpened, Files, Plus, Box } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AppLayout from '../common/AppLayout.vue'

const terminalOutput = ref([])
const currentCommand = ref('')
const commandHistory = ref([])
const historyIndex = ref(-1)
const isProcessing = ref(false)
const terminalBody = ref(null)
const commandInput = ref(null)

// Git 仓库状态
const gitState = reactive({
  isInitialized: false,
  hasChanges: false,
  hasStagedChanges: false,
  hasCommits: false,
  currentBranch: 'main',
  branches: ['main'],
  commits: [],
  stagedFiles: [],
  workingFiles: [],
  currentPath: 'project' // 当前工作目录
})

// 文件树数据
const fileTree = ref([
  {
    label: 'project',
    children: []
  }
])

// 文件树的属性配置
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 解析路径
const resolvePath = (path) => {
  if (path.startsWith('/')) {
    return 'project' + path
  }
  const parts = path.split('/')
  const currentParts = gitState.currentPath.split('/')
  const resultParts = [...currentParts]

  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') {
      if (resultParts.length > 1) {
        resultParts.pop()
      }
      continue
    }
    resultParts.push(part)
  }

  return resultParts.join('/')
}

// 获取当前目录的显示路径
const getDisplayPath = () => {
  const path = gitState.currentPath
  if (path === 'project') return '/'
  return '/' + path.substring('project'.length + 1)
}

// 命令提示符
const getPrompt = () => {
  return `${getDisplayPath()} $`
}

// 更新文件树
const updateFileTree = (filePath, remove = false) => {
  if (remove) {
    const removeFile = (tree, path) => {
      const parts = path.split('/')
      let current = tree
      
      for (let i = 1; i < parts.length - 1; i++) {
        const found = current.find(node => node.label === parts[i])
        if (!found || !found.children) return
        current = found.children
      }
      
      const index = current.findIndex(node => node.label === parts[parts.length - 1])
      if (index !== -1) {
        current.splice(index, 1)
      }
    }
    removeFile(fileTree.value[0].children, filePath)
    return
  }

  // 创建或更新文件
  const parts = filePath.split('/')
  let current = fileTree.value[0].children

  // 从第二个部分开始（跳过 'project'）
  for (let i = 1; i < parts.length - 1; i++) {
    let found = current.find(node => node.label === parts[i])
    if (!found) {
      found = {
        label: parts[i],
        children: []
      }
      current.push(found)
    }
    if (!found.children) {
      found.children = []
    }
    current = found.children
  }

  // 添加文件
  const fileName = parts[parts.length - 1]
  if (!current.find(node => node.label === fileName)) {
    current.push({
      label: fileName
    })
  }
}

// 创建文件
const createFile = (fileName) => {
  if (!fileName) {
    addOutput('错误：请指定文件名', 'error')
    return
  }

  const resolvedPath = resolvePath(fileName)
  
  // 检查文件是否已存在
  if (gitState.workingFiles.includes(resolvedPath) || gitState.stagedFiles.includes(resolvedPath)) {
    addOutput(`错误：文件 '${fileName}' 已存在`, 'error')
    return
  }

  gitState.hasChanges = true
  gitState.workingFiles.push(resolvedPath)
  updateFileTree(resolvedPath)
  addOutput(`已创建文件：${resolvedPath}`)
}

// 添加终端输出
const addOutput = (content, type = 'output') => {
  if (content === undefined || content === null || content === '') return
  
  // 如果不是命令类型，就添加到最后一个命令的输出中
  if (type !== 'command' && terminalOutput.value.length > 0) {
    const lastLine = terminalOutput.value[terminalOutput.value.length - 1]
    if (lastLine.type === 'command') {
      terminalOutput.value.push({ content, type })
    } else {
      // 如果最后一行不是命令，就追加到当前输出
      lastLine.content += '\n' + content
    }
  } else {
    // 如果是命令或者没有前面的输出，就直接添加新行
    terminalOutput.value.push({ content, type })
  }
  
  // 滚动到底部
  nextTick(() => {
    if (terminalBody.value) {
      terminalBody.value.scrollTop = terminalBody.value.scrollHeight
    }
  })
}

// 执行命令
const executeCommand = async () => {
  if (!currentCommand.value.trim()) return
  
  const command = currentCommand.value.trim()
  addOutput(command, 'command')
  
  isProcessing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 100))
    await processCommand(command)
  } catch (error) {
    addOutput(`错误：${error.message}`, 'error')
  } finally {
    isProcessing.value = false
    currentCommand.value = ''
    if (command.trim()) {
      commandHistory.value.push(command)
      historyIndex.value = commandHistory.value.length
    }

    nextTick(() => {
      focusInput()
      if (terminalBody.value) {
        terminalBody.value.scrollTop = terminalBody.value.scrollHeight
      }
    })
  }
}

// 处理所有命令
const processCommand = async (command) => {
  const cmd = command.toLowerCase().trim()

  if (cmd === 'clear' || cmd === 'cls') {
    terminalOutput.value = []
    addOutput('欢迎使用 Git 命令练习终端！')
    addOutput('输入 help 查看可用命令。')
    return
  }

  if (!cmd) return

  if (cmd === 'help' || cmd === 'git help') {
    addOutput(`
可用的 Git 命令：
  git init              - 初始化仓库
  git status           - 查看仓库状态
  git add .            - 添加所有更改到暂存区
  git add <文件>        - 添加指定文件到暂存区
  git commit -m "msg"  - 提交更改
  git branch           - 查看分支
  git branch <名称>     - 创建分支
  git checkout <分支>   - 切换分支
  git merge <分支>      - 合并分支
  git log              - 查看提交历史
  git reset            - 重置更改
  
文件操作命令：
  ls, dir              - 列出当前目录文件
  pwd                  - 显示当前目录
  cd <目录>            - 切换目录
  touch <文件名>        - 创建新文件
  mkdir <目录名>        - 创建新目录
  rm <文件名>          - 删除文件
  mv <源文件> <目标文件> - 移动/重命名文件
  clear, cls          - 清空终端
  help                - 显示本帮助信息`)
    return
  }

  if (cmd.startsWith('git ')) {
    const gitCmd = cmd.substring(4)
    
    if (gitCmd !== 'init' && !gitState.isInitialized) {
      addOutput('错误：Git 仓库尚未初始化。请先运行 git init', 'error')
      return
    }

    if (gitCmd === 'init') {
      if (gitState.isInitialized) {
        addOutput('Git 仓库已经初始化')
        return
      }
      gitState.isInitialized = true
      // 初始化时创建 README.md
      createFile('README.md')
      addOutput('已初始化空的 Git 仓库')
      return
    }

    if (gitCmd === 'status') {
      addOutput(`
位于分支 ${gitState.currentBranch}
${gitState.hasChanges ? '有未跟踪的文件：' : '工作区清洁'}
${gitState.workingFiles.map(file => `  ${file}`).join('\n')}
${gitState.stagedFiles.length > 0 ? '\n要提交的变更：' : ''}
${gitState.stagedFiles.map(file => `  ${file}`).join('\n')}`)
      return
    }

    if (gitCmd === 'add .') {
      if (gitState.workingFiles.length === 0) {
        addOutput('没有要添加的文件')
        return
      }
      gitState.stagedFiles.push(...gitState.workingFiles)
      gitState.workingFiles = []
      gitState.hasStagedChanges = true
      addOutput('已添加所有更改到暂存区')
      return
    }

    if (gitCmd.startsWith('add ')) {
      const file = gitCmd.substring(4).trim()
      const resolvedPath = resolvePath(file)
      if (!gitState.workingFiles.includes(resolvedPath)) {
        addOutput(`错误：文件 '${file}' 不存在或未更改`)
        return
      }
      gitState.stagedFiles.push(resolvedPath)
      gitState.workingFiles = gitState.workingFiles.filter(f => f !== resolvedPath)
      gitState.hasStagedChanges = true
      addOutput(`已添加文件 '${file}' 到暂存区`)
      return
    }

    if (gitCmd.startsWith('commit -m ')) {
      if (!gitState.hasStagedChanges) {
        addOutput('没有要提交的更改')
        return
      }
      const message = command.substring(13).trim().replace(/['"]/g, '')
      if (!message) {
        addOutput('错误：请提供提交信息')
        return
      }
      gitState.commits.push({
        message,
        files: [...gitState.stagedFiles],
        branch: gitState.currentBranch,
        date: new Date().toISOString()
      })
      gitState.stagedFiles = []
      gitState.hasStagedChanges = false
      gitState.hasCommits = true
      addOutput(`[${gitState.currentBranch} ${gitState.commits.length}] ${message}`)
      return
    }

    addOutput(`git: '${gitCmd}' 不是一个有效的 git 命令`, 'error')
    return
  }

  if (cmd === 'pwd') {
    addOutput(getDisplayPath())
    return
  }

  if (cmd.startsWith('touch ')) {
    const fileName = command.substring(6).trim()
    createFile(fileName)
    return
  }

  if (cmd.startsWith('mkdir ')) {
    const dirName = command.substring(6).trim()
    if (!dirName) {
      addOutput('错误：请指定目录名', 'error')
      return
    }
    const resolvedPath = resolvePath(dirName)
    updateFileTree(resolvedPath + '/.gitkeep')
    addOutput(`已创建目录：${resolvedPath}`)
    return
  }

  if (cmd === 'ls' || cmd === 'dir') {
    const currentDir = gitState.currentPath
    const files = [...gitState.workingFiles, ...gitState.stagedFiles].filter(file => {
      const filePath = file.split('/')
      const dirParts = currentDir.split('/')
      return filePath.slice(0, dirParts.length).join('/') === currentDir &&
             filePath.length > dirParts.length
    })
    
    if (files.length === 0) {
      addOutput('当前目录为空')
    } else {
      files.forEach(file => {
        const isStaged = gitState.stagedFiles.includes(file)
        const type = isStaged ? 'staged' : 'file'
        const displayName = file.split('/').pop()
        addOutput(displayName, type)
      })
    }
    return
  }

  addOutput(`命令未找到：${command}`, 'error')
}

// 命令历史导航
const showPreviousCommand = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    currentCommand.value = commandHistory.value[historyIndex.value]
  }
}

const showNextCommand = () => {
  if (historyIndex.value < commandHistory.value.length - 1) {
    historyIndex.value++
    currentCommand.value = commandHistory.value[historyIndex.value]
  } else {
    historyIndex.value = commandHistory.value.length
    currentCommand.value = ''
  }
}

// 聚焦输入框
const focusInput = () => {
  nextTick(() => {
    if (commandInput.value) {
      commandInput.value.focus()
    }
  })
}

onMounted(() => {
  addOutput('欢迎使用 Git 命令练习终端！')
  addOutput('输入 help 查看可用命令。')
  focusInput()
})
</script>

<style lang="scss" scoped>
.git-practice {
  padding: 1rem 2rem;
  padding-bottom: 0;
  
  h1 {
    margin: 0;
    font-size: 2rem;
    color: var(--text-primary);
  }

  .description {
    margin: 0.5rem 0 1rem;
    color: var(--text-secondary);
  }

  .practice-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .terminal-section {
    .terminal {
      background: #1e1e1e !important;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

      .terminal-header {
        background: #323232 !important;
        padding: 0.5rem 1rem;
        display: flex;
        align-items: center;
        
        .terminal-buttons {
          display: flex;
          gap: 0.5rem;
          margin-right: 1rem;

          span {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
          }

          .close { background: #ff5f56; }
          .minimize { background: #ffbd2e; }
          .maximize { background: #27c93f; }
        }

        .terminal-title {
          color: #fff;
          font-size: 0.9rem;
        }
      }

      .terminal-body {
        padding: 1rem;
        height: 360px; 
        overflow-y: auto;
        color: #fff;
        font-size: 14px; 

        .terminal-line {
          margin-bottom: 0.25rem; 
          font-family: monospace;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .prompt {
          color: #98c379;
          margin-right: 0.5rem;
        }

        .command {
          color: #fff;
        }

        .error {
          color: #e06c75;
        }

        .output {
          color: #abb2bf;
        }

        .terminal-input-line {
          display: flex;
          align-items: center;
          margin-top: 0.25rem; 

          input {
            flex: 1;
            background: transparent;
            border: none;
            color: #fff;
            font-family: monospace;
            font-size: 14px;
            padding: 0.25rem;
            margin-left: 0.5rem;

            &:focus {
              outline: none;
            }

            &::placeholder {
              color: #abb2bf;
              opacity: 0.5;
            }
          }
        }
      }
    }
  }

  .visualization-section {
    h3 {
      margin: 0 0 1rem;
      color: var(--text-primary);
    }

    .git-status {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;

      .status-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        border-radius: 8px;
        background: var(--background-light);
        color: var(--text-secondary);
        transition: all 0.3s ease;

        &.active {
          background: var(--primary-color);
          color: white;

          .el-icon {
            color: white;
          }
        }

        .el-icon {
          font-size: 1.5rem;
          color: var(--text-secondary);
        }
      }
    }

    .file-tree {
      background: var(--background-light);
      padding: 1rem;
      border-radius: 8px;

      h4 {
        margin: 0 0 1rem;
        color: var(--text-primary);
      }
    }
  }
}

// 添加底部样式
:deep(.app-footer) {
  padding: 0.75rem 0;
  font-size: 0.875rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0.5rem;
  
  .footer-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;

    .footer-section {
      h3 {
        margin: 0 0 0.5rem;
        font-size: 1rem;
        color: var(--text-primary);
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          margin-bottom: 0.25rem;
          
          a {
            color: var(--text-secondary);
            text-decoration: none;
            
            &:hover {
              color: var(--primary-color);
            }
          }
        }
      }
    }
  }

  .copyright {
    text-align: center;
    color: var(--text-secondary);
    margin-top: 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
