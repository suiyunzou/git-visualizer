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
            <el-alert
              type="info"
              :title="currentStep.hint"
              :closable="false"
            />
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
                <span class="prompt">$</span>
                <span :class="line.type">{{ line.content }}</span>
              </div>
              <div class="input-line">
                <span class="prompt">$</span>
                <input 
                  ref="commandInput"
                  v-model="currentCommand"
                  @keyup.enter="executeCommand"
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '../common/AppLayout.vue'
import scenarios from '@/data/scenarios'
import { FolderOpened, Files, Plus, Box } from '@element-plus/icons-vue'

const route = useRoute()
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

// Git 状态
const gitState = ref({
  isRepo: false,
  hasChanges: false,
  hasStagedChanges: false,
  hasCommits: false
})

// 获取当前场景
const currentScenario = computed(() => {
  return scenarios.find(s => s.id === route.params.id) || scenarios[0]
})

// 获取当前步骤
const currentStep = computed(() => {
  return currentScenario.value.steps[currentStepIndex.value]
})

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

const processCommand = async (command) => {
  const cmd = command.toLowerCase().trim()
  
  if (cmd === 'help') {
    terminalOutput.value.push({
      type: 'output',
      content: `可用命令：
git init - 初始化仓库
git add <file> - 添加文件到暂存区
git commit -m "msg" - 提交更改
git status - 查看状态
clear - 清空终端`
    })
    return
  }

  if (cmd === 'clear') {
    terminalOutput.value = []
    return
  }

  if (cmd.startsWith('git ')) {
    const gitCmd = cmd.substring(4)
    
    if (gitCmd === 'init') {
      gitState.value.isRepo = true
      terminalOutput.value.push({ type: 'output', content: '初始化空的 Git 仓库' })
      checkStepCompletion()
      return
    }

    if (gitCmd === 'status') {
      terminalOutput.value.push({ 
        type: 'output', 
        content: `位于分支 main
${gitState.value.hasChanges ? '有未跟踪的文件' : '工作区清洁'}
${gitState.value.hasStagedChanges ? '有暂存的更改' : ''}`
      })
      return
    }

    // 处理其他 git 命令...
  }

  terminalOutput.value.push({ type: 'error', content: `未知命令: ${command}` })
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
      background: var(--background-white);
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
      }
    }

    .terminal-panel {
      padding: 0;
      
      .terminal-window {
        height: 100%;
        background: #1e1e1e;
        border-radius: 8px;
        overflow: hidden;

        .terminal-header {
          background: #323232;
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
