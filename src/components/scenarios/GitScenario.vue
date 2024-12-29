<template>
  <app-layout>
    <div class="git-scenario">
      <!-- 顶部进度条 -->
      <div class="progress-section">
        <el-steps :active="currentStepIndex" finish-status="success">
          <el-step 
            v-for="step in currentScenario.steps" 
            :key="step.id" 
            :title="step.title"
          />
        </el-steps>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧任务说明 -->
        <div class="task-panel">
          <h3>当前任务</h3>
          <p>{{ currentStep.description }}</p>
          <div v-if="showHint" class="hint-section">
            <el-card class="hint-card">
              <template #header>
                <div class="hint-header">
                  <el-icon><InfoFilled /></el-icon>
                  <span>操作提示</span>
                </div>
              </template>
              <div class="hint-content">
                <p class="hint-text">{{ currentStep.hint }}</p>
                <div class="command-examples">
                  <h4>示例命令：</h4>
                  <div v-for="(cmd, index) in currentStep.commandExamples" 
                       :key="index" 
                       class="command-example">
                    <code>$ {{ cmd.command }}</code>
                    <span class="command-desc">{{ cmd.description }}</span>
                  </div>
                </div>
                <div class="hint-tips" v-if="currentStep.tips">
                  <h4>小贴士：</h4>
                  <ul>
                    <li v-for="(tip, index) in currentStep.tips" 
                        :key="index">{{ tip }}</li>
                  </ul>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 中间终端 -->
        <div class="terminal-panel">
          <div class="terminal-window">
            <div class="terminal-header">
              <div class="terminal-buttons">
                <span class="button red"></span>
                <span class="button yellow"></span>
                <span class="button green"></span>
              </div>
              <span class="terminal-title">Git Bash</span>
            </div>
            <div class="terminal-body" ref="terminalBody" @click="focusInput">
              <div v-for="(line, index) in terminalOutput" :key="index" class="output-line">
                <span v-if="line.type === 'command'" class="prompt">$</span>
                <span :class="line.type">{{ line.content }}</span>
              </div>
              <div class="input-line">
                <span class="prompt">$</span>
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

        <!-- 右侧状态面板 -->
        <div class="status-panel">
          <h3>Git 状态可视化</h3>
          <div class="status-list">
            <div class="status-item" :class="{ active: gitState.isRepo }">
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
        </div>
      </div>

      <!-- 底部控制栏 -->
      <div class="control-bar">
        <el-button @click="showHint = !showHint">
          {{ showHint ? '隐藏提示' : '显示提示' }}
        </el-button>
        <el-button 
          type="primary" 
          :disabled="!canProceed"
          @click="nextStep"
        >
          下一步
        </el-button>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../common/AppLayout.vue'
import scenarios from '@/data/scenarios'
import { FolderOpened, Files, Plus, Box, InfoFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const showHint = ref(false)
const currentStepIndex = ref(0)
const currentCommand = ref('')
const isProcessing = ref(false)
const terminalOutput = ref([
  { type: 'output', content: '欢迎使用 Git 命令练习终端！' },
  { type: 'output', content: '输入 help 查看可用命令。' }
])
const terminalBody = ref(null)
const commandInput = ref(null)

// 添加命令历史记录
const commandHistory = ref([])
const historyIndex = ref(-1)

// Git 状态扩展
const gitState = ref({
  isRepo: false,
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

// 解析路径
const resolvePath = (path) => {
  if (path.startsWith('/')) {
    return 'project' + path
  }
  const parts = path.split('/')
  const currentParts = gitState.value.currentPath.split('/')
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
  const path = gitState.value.currentPath
  if (path === 'project') return '/'
  return '/' + path.substring('project'.length + 1)
}

// 创建文件
const createFile = (fileName) => {
  if (!fileName) {
    addOutput('错误：请指定文件名', 'error')
    return
  }

  const resolvedPath = resolvePath(fileName)
  
  if (gitState.value.workingFiles.includes(resolvedPath) || 
      gitState.value.stagedFiles.includes(resolvedPath)) {
    addOutput(`错误：文件 '${fileName}' 已存在`, 'error')
    return
  }

  gitState.value.hasChanges = true
  gitState.value.workingFiles.push(resolvedPath)
  addOutput(`已创建文件：${resolvedPath}`)
}

// 处理命令
const processCommand = async (command) => {
  const cmd = command.toLowerCase().trim()
  
  if (cmd === 'help') {
    addOutput(`可用命令：
Git 命令：
  git init              - 初始化仓库
  git status           - 查看仓库状态
  git add <文件>        - 添加文件到暂存区
  git add .            - 添加所有文件到暂存区
  git commit -m "消息"  - 提交更改
  git branch           - 查看分支
  git branch <名称>     - 创建分支
  git checkout <分支>   - 切换分支
  git merge <分支>      - 合并分支
  git log              - 查看提交历史

文件操作：
  ls, dir              - 列出当前目录文件
  pwd                  - 显示当前目录
  cd <目录>            - 切换目录
  touch <文件名>        - 创建新文件
  mkdir <目录名>        - 创建新目录
  rm <文件名>          - 删除文件
  
其他命令：
  clear               - 清空终端
  help                - 显示本帮助信息`)
    return
  }

  if (cmd === 'clear') {
    terminalOutput.value = []
    return
  }

  if (cmd === 'pwd') {
    addOutput(getDisplayPath())
    return
  }

  if (cmd.startsWith('cd ')) {
    const dir = command.substring(3).trim()
    const newPath = resolvePath(dir)
    gitState.value.currentPath = newPath
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
    gitState.value.workingFiles.push(resolvedPath + '/.gitkeep')
    addOutput(`已创建目录：${resolvedPath}`)
    return
  }

  if (cmd === 'ls' || cmd === 'dir') {
    const currentDir = gitState.value.currentPath
    const files = [...gitState.value.workingFiles, ...gitState.value.stagedFiles]
      .filter(file => {
        const filePath = file.split('/')
        const dirParts = currentDir.split('/')
        return filePath.slice(0, dirParts.length).join('/') === currentDir &&
               filePath.length > dirParts.length
      })
    
    if (files.length === 0) {
      addOutput('当前目录为空')
    } else {
      files.forEach(file => {
        const isStaged = gitState.value.stagedFiles.includes(file)
        addOutput(file.split('/').pop() + (isStaged ? ' (已暂存)' : ''))
      })
    }
    return
  }

  if (cmd.startsWith('git ')) {
    const gitCmd = cmd.substring(4)
    
    if (gitCmd === 'init') {
      if (gitState.value.isRepo) {
        addOutput('Git 仓库已经初始化')
        return
      }
      gitState.value.isRepo = true
      addOutput('已初始化空的 Git 仓库')
      checkStepCompletion()
      return
    }

    if (!gitState.value.isRepo) {
      addOutput('错误：未初始化的 Git 仓库', 'error')
      return
    }

    if (gitCmd === 'status') {
      addOutput(`位于分支 ${gitState.value.currentBranch}
${gitState.value.hasChanges ? '\n未跟踪的文件：' : '\n工作区清洁'}
${gitState.value.workingFiles.map(file => `  ${file}`).join('\n')}
${gitState.value.stagedFiles.length > 0 ? '\n要提交的变更：' : ''}
${gitState.value.stagedFiles.map(file => `  ${file}`).join('\n')}`)
      return
    }

    if (gitCmd === 'add .') {
      if (gitState.value.workingFiles.length === 0) {
        addOutput('没有要添加的文件')
        return
      }
      gitState.value.stagedFiles.push(...gitState.value.workingFiles)
      gitState.value.workingFiles = []
      gitState.value.hasStagedChanges = true
      addOutput('已添加所有更改到暂存区')
      checkStepCompletion()
      return
    }

    if (gitCmd.startsWith('add ')) {
      const file = gitCmd.substring(4).trim()
      const resolvedPath = resolvePath(file)
      if (!gitState.value.workingFiles.includes(resolvedPath)) {
        addOutput(`错误：文件 '${file}' 不存在或未更改`)
        return
      }
      gitState.value.stagedFiles.push(resolvedPath)
      gitState.value.workingFiles = gitState.value.workingFiles.filter(f => f !== resolvedPath)
      gitState.value.hasStagedChanges = true
      addOutput(`已添加文件 '${file}' 到暂存区`)
      checkStepCompletion()
      return
    }

    if (gitCmd.startsWith('commit -m ')) {
      if (!gitState.value.hasStagedChanges) {
        addOutput('没有要提交的更改')
        return
      }
      const message = command.substring(13).trim().replace(/['"]/g, '')
      if (!message) {
        addOutput('错误：请提供提交信息')
        return
      }
      gitState.value.commits.push({
        message,
        files: [...gitState.value.stagedFiles],
        branch: gitState.value.currentBranch,
        date: new Date().toISOString()
      })
      gitState.value.stagedFiles = []
      gitState.value.hasStagedChanges = false
      gitState.value.hasCommits = true
      addOutput(`[${gitState.value.currentBranch} ${gitState.value.commits.length}] ${message}`)
      checkStepCompletion()
      return
    }

    addOutput(`git: '${gitCmd}' 不是一个有效的 git 命令`, 'error')
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

// 添加输出
const addOutput = (content, type = 'output') => {
  if (!content) return
  terminalOutput.value.push({ type, content })
  scrollToBottom()
}

// 终端相关方法
const focusInput = () => {
  commandInput.value?.focus()
}

const executeCommand = async () => {
  if (!currentCommand.value.trim() || isProcessing.value) return
  
  const command = currentCommand.value.trim()
  terminalOutput.value.push({ type: 'command', content: command })
  
  isProcessing.value = true
  try {
    await processCommand(command)
  } catch (error) {
    terminalOutput.value.push({ type: 'error', content: error.message })
  } finally {
    isProcessing.value = false
    currentCommand.value = ''
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  setTimeout(() => {
    if (terminalBody.value) {
      terminalBody.value.scrollTop = terminalBody.value.scrollHeight
    }
  }, 0)
}

// 检查步骤完成情况
const checkStepCompletion = () => {
  const expectedState = currentStep.value.expectedState
  if (expectedState) {
    if (expectedState.hasGitInit) {
      canProceed.value = gitState.value.isRepo
    }
    // 添加其他状态检查...
  }
}

// 进入下一步
const nextStep = () => {
  if (currentStepIndex.value < currentScenario.value.steps.length - 1) {
    currentStepIndex.value++
    canProceed.value = false
    showHint.value = false
  }
}

// 初始化
onMounted(() => {
  focusInput()
})

const canProceed = ref(false)

// 恢复并增强计算属性
const currentScenario = computed(() => {
  const scenario = scenarios.find(s => s.id === route.params.id)
  if (!scenario) {
    // 如果场景不存在，重定向到第一个场景
    router.replace(`/scenarios/${scenarios[0].id}`)
    return scenarios[0]
  }
  return scenario
})

const currentStep = computed(() => {
  return currentScenario.value.steps[currentStepIndex.value]
})

// 监听路由变化，重置状态
watch(() => route.params.id, () => {
  // 重置状态
  currentStepIndex.value = 0
  showHint.value = false
  canProceed.value = false
  gitState.value = {
    isRepo: false,
    hasChanges: false,
    hasStagedChanges: false,
    hasCommits: false,
    currentBranch: 'main',
    branches: ['main'],
    commits: [],
    stagedFiles: [],
    workingFiles: [],
    currentPath: 'project'
  }
  // 重置终端输出
  terminalOutput.value = [
    { type: 'output', content: '欢迎使用 Git 命令练习终端！' },
    { type: 'output', content: '输入 help 查看可用命令。' }
  ]
})
</script>

<style lang="scss" scoped>
.git-scenario {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;

  .progress-section {
    padding: 20px;
    background: var(--background-white);
    border-radius: var(--border-radius);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .main-content {
    display: grid;
    grid-template-columns: 300px 1fr 300px;
    gap: 20px;
    flex: 1;

    .task-panel,
    .terminal-panel,
    .status-panel {
      background: var(--card-background);
      border-radius: var(--border-radius);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }

    .task-panel {
      h3 {
        margin-bottom: 16px;
        color: var(--text-primary);
      }

      p {
        color: var(--text-secondary);
        line-height: 1.6;
      }

      .hint-section {
        margin-top: 16px;

        .hint-card {
          border: 1px solid var(--el-border-color-light);
          
          .hint-header {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--el-color-primary);
            
            .el-icon {
              font-size: 18px;
            }
          }

          .hint-content {
            .hint-text {
              color: var(--el-text-color-primary);
              margin-bottom: 16px;
            }

            .command-examples {
              background: var(--el-fill-color-light);
              padding: 12px;
              border-radius: 4px;
              margin-bottom: 16px;

              h4 {
                color: var(--el-text-color-primary);
                margin-bottom: 8px;
                font-size: 14px;
              }

              .command-example {
                margin-bottom: 8px;
                
                code {
                  display: block;
                  font-family: monospace;
                  background: var(--el-color-info-light-9);
                  padding: 6px 12px;
                  border-radius: 4px;
                  color: var(--el-color-primary);
                  margin-bottom: 4px;
                }

                .command-desc {
                  font-size: 12px;
                  color: var(--el-text-color-secondary);
                  padding-left: 12px;
                }

                &:last-child {
                  margin-bottom: 0;
                }
              }
            }

            .hint-tips {
              h4 {
                color: var(--el-text-color-primary);
                margin-bottom: 8px;
                font-size: 14px;
              }

              ul {
                list-style: none;
                padding-left: 0;
                
                li {
                  position: relative;
                  padding-left: 20px;
                  color: var(--el-text-color-secondary);
                  font-size: 13px;
                  margin-bottom: 6px;

                  &::before {
                    content: "•";
                    position: absolute;
                    left: 8px;
                    color: var(--el-color-primary);
                  }
                }
              }
            }
          }
        }
      }
    }

    .terminal-panel {
      padding: 0;
      
      .terminal-window {
        height: 100%;
        background: var(--terminal-background);
        border-radius: 8px;
        overflow: hidden;

        .terminal-header {
          background: var(--terminal-header);
          padding: 8px 16px;
          display: flex;
          align-items: center;

          .terminal-buttons {
            display: flex;
            gap: 8px;
            margin-right: 16px;

            .button {
              width: 12px;
              height: 12px;
              border-radius: 50%;

              &.red { background: #ff5f56; }
              &.yellow { background: #ffbd2e; }
              &.green { background: #27c93f; }
            }
          }

          .terminal-title {
            color: #fff;
            font-size: 14px;
          }
        }

        .terminal-body {
          padding: 16px;
          height: 400px;
          overflow-y: auto;
          color: #fff;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.6;

          .output-line, .input-line {
            display: flex;
            margin-bottom: 8px;
            
            .prompt {
              color: #98c379;
              margin-right: 8px;
              user-select: none;
            }

            .command {
              color: #fff;
            }

            .output {
              color: #abb2bf;
            }

            .error {
              color: #e06c75;
            }
          }

          .input-line {
            input {
              flex: 1;
              background: transparent;
              border: none;
              color: #fff;
              font-family: monospace;
              font-size: 14px;
              outline: none;
              padding: 0;
              margin: 0;

              &::placeholder {
                color: #666;
              }

              &:disabled {
                opacity: 0.5;
              }
            }
          }

          &::-webkit-scrollbar {
            width: 8px;
          }

          &::-webkit-scrollbar-track {
            background: #1e1e1e;
          }

          &::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 4px;
          }
        }
      }
    }

    .status-panel {
      h3 {
        margin-bottom: 16px;
        color: var(--text-primary);
      }

      .status-list {
        display: grid;
        gap: 12px;

        .status-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--background-light);
          border-radius: 6px;
          transition: all 0.3s ease;
          color: var(--text-secondary);

          &.active {
            background: var(--primary-color);
            color: white;

            .el-icon {
              color: white;
            }
          }
        }
      }
    }
  }

  .control-bar {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px;
    background: var(--background-white);
    border-radius: var(--border-radius);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
