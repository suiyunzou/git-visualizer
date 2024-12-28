`<template>
  <app-layout>
    <div class="practice-container">
      <div class="practice-header card">
        <h2>Git 命令实践</h2>
        <p>在这里你可以安全地练习 Git 命令，所有操作都在模拟环境中进行</p>
      </div>

      <div class="practice-content">
        <div class="terminal-section card">
          <div class="terminal-header">
            <div class="terminal-controls">
              <span class="control close"></span>
              <span class="control minimize"></span>
              <span class="control maximize"></span>
            </div>
            <span class="terminal-title">Git Bash</span>
          </div>
          <div class="terminal-window" ref="terminalWindow">
            <div v-for="(line, index) in terminalOutput" :key="index" class="terminal-line">
              <span class="prompt" v-if="line.type === 'input'">$</span>
              <span :class="line.type">{{ line.content }}</span>
            </div>
            <div class="terminal-input-line">
              <span class="prompt">$</span>
              <input
                ref="commandInput"
                v-model="currentCommand"
                @keyup.enter="executeCommand"
                type="text"
                class="command-input"
                placeholder="输入 Git 命令..."
                :disabled="isProcessing"
              />
            </div>
          </div>
        </div>

        <div class="visualization-section card">
          <h3>可视化预览</h3>
          <svg ref="visualizationSvg" class="visualization"></svg>
        </div>
      </div>

      <div class="help-section card">
        <h3>常用命令提示</h3>
        <el-row :gutter="20">
          <el-col :span="8" v-for="(category, index) in commandHelp" :key="index">
            <div class="help-category">
              <h4>{{ category.title }}</h4>
              <ul>
                <li v-for="(cmd, cmdIndex) in category.commands" :key="cmdIndex">
                  <code>{{ cmd.command }}</code>
                  <span class="description">{{ cmd.description }}</span>
                </li>
              </ul>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </app-layout>
</template>

<script>
import { ref, onMounted } from 'vue'
import AppLayout from '../common/AppLayout.vue'

export default {
  name: 'GitCommandPractice',
  components: {
    AppLayout
  },

  setup() {
    const currentCommand = ref('')
    const isProcessing = ref(false)
    const terminalOutput = ref([
      { type: 'output', content: '欢迎使用 Git 命令练习终端！' },
      { type: 'output', content: '输入命令开始练习，输入 help 查看帮助。' }
    ])
    const commandInput = ref(null)
    const terminalWindow = ref(null)

    const commandHelp = [
      {
        title: '基础命令',
        commands: [
          { command: 'git init', description: '初始化仓库' },
          { command: 'git add <file>', description: '添加文件到暂存区' },
          { command: 'git commit -m "msg"', description: '提交更改' }
        ]
      },
      {
        title: '分支操作',
        commands: [
          { command: 'git branch', description: '列出分支' },
          { command: 'git checkout -b <name>', description: '创建并切换分支' },
          { command: 'git merge <branch>', description: '合并分支' }
        ]
      },
      {
        title: '远程操作',
        commands: [
          { command: 'git remote add', description: '添加远程仓库' },
          { command: 'git push', description: '推送到远程' },
          { command: 'git pull', description: '拉取远程更改' }
        ]
      }
    ]

    const executeCommand = async () => {
      if (!currentCommand.value.trim() || isProcessing.value) return

      const command = currentCommand.value.trim()
      terminalOutput.value.push({ type: 'input', content: command })
      
      isProcessing.value = true
      currentCommand.value = ''

      try {
        // 这里实现命令处理逻辑
        const response = await processCommand(command)
        terminalOutput.value.push({ type: 'output', content: response })
      } catch (error) {
        terminalOutput.value.push({ type: 'error', content: error.message })
      } finally {
        isProcessing.value = false
        scrollToBottom()
      }
    }

    const processCommand = async (command) => {
      // 模拟命令处理
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (command === 'help') {
        return '可用命令：\n' +
          'git init - 初始化仓库\n' +
          'git add <file> - 添加文件到暂存区\n' +
          'git commit -m "msg" - 提交更改\n' +
          'clear - 清空终端'
      }
      
      if (command === 'clear') {
        terminalOutput.value = []
        return ''
      }

      return `执行命令: ${command}`
    }

    const scrollToBottom = () => {
      if (terminalWindow.value) {
        terminalWindow.value.scrollTop = terminalWindow.value.scrollHeight
      }
    }

    onMounted(() => {
      commandInput.value?.focus()
    })

    return {
      currentCommand,
      isProcessing,
      terminalOutput,
      commandInput,
      terminalWindow,
      commandHelp,
      executeCommand
    }
  }
}
</script>

<style lang="scss" scoped>
.practice-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.practice-header {
  text-align: center;
  padding: 40px 20px;
  margin-bottom: 20px;

  h2 {
    color: var(--primary-color);
    margin-bottom: 10px;
  }

  p {
    color: var(--text-secondary);
  }
}

.practice-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.terminal-section {
  .terminal-header {
    background: #2d2d2d;
    padding: 8px 16px;
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    display: flex;
    align-items: center;
  }

  .terminal-controls {
    display: flex;
    gap: 8px;
    margin-right: 16px;

    .control {
      width: 12px;
      height: 12px;
      border-radius: 50%;

      &.close { background: #ff5f56; }
      &.minimize { background: #ffbd2e; }
      &.maximize { background: #27c93f; }
    }
  }

  .terminal-title {
    color: #fff;
    font-size: 14px;
  }

  .terminal-window {
    background: #1e1e1e;
    color: #fff;
    padding: 16px;
    height: 400px;
    overflow-y: auto;
    font-family: 'Consolas', monospace;
    font-size: 14px;
  }

  .terminal-line {
    margin-bottom: 8px;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .prompt {
    color: #27c93f;
    margin-right: 8px;
  }

  .input {
    color: #fff;
  }

  .output {
    color: #ddd;
  }

  .error {
    color: #ff5f56;
  }

  .terminal-input-line {
    display: flex;
    align-items: center;
  }

  .command-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-family: 'Consolas', monospace;
    font-size: 14px;
    outline: none;
    padding: 0;
    margin-left: 8px;

    &::placeholder {
      color: #666;
    }
  }
}

.visualization-section {
  padding: 20px;

  h3 {
    margin-bottom: 20px;
    color: var(--text-primary);
  }

  .visualization {
    width: 100%;
    height: 400px;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
  }
}

.help-section {
  padding: 20px;

  h3 {
    margin-bottom: 20px;
    color: var(--text-primary);
  }

  .help-category {
    margin-bottom: 20px;

    h4 {
      color: var(--primary-color);
      margin-bottom: 10px;
    }

    ul {
      list-style: none;
      padding: 0;

      li {
        margin-bottom: 8px;
        display: flex;
        flex-direction: column;

        code {
          background: var(--background-light);
          padding: 4px 8px;
          border-radius: 4px;
          font-family: 'Consolas', monospace;
          margin-bottom: 4px;
        }

        .description {
          color: var(--text-secondary);
          font-size: 14px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .practice-content {
    grid-template-columns: 1fr;
  }
}
</style>`
