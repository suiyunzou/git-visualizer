<template>
  <div class="git-scene">
    <!-- 只保留进度条 -->
    <div class="progress-bar">
      <div class="step-item" :class="{ active: currentStep >= 1 }">
        <span class="step-number">1</span>
        <span class="step-text">初始化仓库</span>
      </div>
      <div class="step-item" :class="{ active: currentStep >= 2 }">
        <span class="step-number">2</span>
        <span class="step-text">添加文件</span>
      </div>
      <div class="step-item" :class="{ active: currentStep >= 3 }">
        <span class="step-number">3</span>
        <span class="step-text">提交更改</span>
      </div>
    </div>

    <div class="scene-content">
      <!-- 左侧任务说明 -->
      <div class="task-panel">
        <h3>当前任务</h3>
        <p>{{ currentTask }}</p>
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
            <span class="terminal-title">命令行</span>
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
                placeholder="输入 Git 命令..."
                :disabled="isProcessing"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧状态 -->
      <div class="status-panel">
        <h3>Git 状态可视化</h3>
        <div class="status-list">
          <div class="status-item" :class="{ active: gitState.isRepo }">
            <i class="el-icon folder"></i>
            <span>Git 仓库</span>
          </div>
          <div class="status-item" :class="{ active: gitState.hasChanges }">
            <i class="el-icon document"></i>
            <span>工作区更改</span>
          </div>
          <div class="status-item" :class="{ active: gitState.hasStaged }">
            <i class="el-icon plus"></i>
            <span>暂存区</span>
          </div>
          <div class="status-item" :class="{ active: gitState.hasCommits }">
            <i class="el-icon check"></i>
            <span>提交历史</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GitScene',
  data() {
    return {
      currentStep: 1,
      currentTask: '创建一个新的 Git 仓库并添加初始文件',
      currentCommand: '',
      isProcessing: false,
      terminalOutput: [
        { type: 'output', content: '欢迎使用 Git 命令练习器！' },
        { type: 'output', content: '输入 help 查看可用命令。' }
      ],
      gitState: {
        isRepo: false,
        hasChanges: false,
        hasStaged: false,
        hasCommits: false
      }
    }
  },
  methods: {
    focusInput() {
      this.$refs.commandInput?.focus()
    },
    async executeCommand() {
      if (!this.currentCommand.trim() || this.isProcessing) return
      
      this.isProcessing = true
      this.terminalOutput.push({ type: 'command', content: this.currentCommand })
      
      // 处理命令
      await this.processCommand(this.currentCommand)
      
      this.currentCommand = ''
      this.isProcessing = false
      this.focusInput()
    },
    async processCommand(command) {
      const cmd = command.toLowerCase().trim()
      
      if (cmd === 'help') {
        this.terminalOutput.push({
          type: 'output',
          content: `可用的 Git 命令：
  git init              - 初始化仓库
  git status           - 查看仓库状态
  git add <文件>        - 添加文件到暂存区
  git commit -m "消息"  - 提交更改`
        })
        return
      }

      // 根据不同命令更新状态
      if (cmd === 'git init') {
        this.gitState.isRepo = true
        this.terminalOutput.push({ type: 'output', content: '初始化空的 Git 仓库' })
      } else if (cmd.startsWith('git add')) {
        if (!this.gitState.isRepo) {
          this.terminalOutput.push({ type: 'error', content: '错误：不是 Git 仓库' })
          return
        }
        this.gitState.hasStaged = true
        this.terminalOutput.push({ type: 'output', content: '已添加到暂存区' })
      } else if (cmd.startsWith('git commit')) {
        if (!this.gitState.hasStaged) {
          this.terminalOutput.push({ type: 'error', content: '错误：没有要提交的更改' })
          return
        }
        this.gitState.hasCommits = true
        this.gitState.hasStaged = false
        this.terminalOutput.push({ type: 'output', content: '已提交更改' })
      }
    },
    resetState() {
      this.currentStep = 1;
      this.currentTask = '创建一个新的 Git 仓库并添加初始文件';
      this.currentCommand = '';
      this.isProcessing = false;
      this.terminalOutput = [
        { type: 'output', content: '欢迎使用 Git 命令练习器！' },
        { type: 'output', content: '输入 help 查看可用命令。' }
      ];
      this.gitState = {
        isRepo: false,
        hasChanges: false,
        hasStaged: false,
        hasCommits: false
      };
    }
  },
  mounted() {
    this.focusInput();
    // 添加点击事件监听器
    this.$el.addEventListener('click', this.resetState);
  },
  beforeDestroy() {
    // 移除事件监听器以防内存泄漏
    this.$el.removeEventListener('click', this.resetState);
  }
}
</script>

<style scoped>
.git-scene {
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #f5f7fa;
}

.progress-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: relative;
}

.progress-bar::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50px;
  right: 50px;
  height: 2px;
  background: #e0e0e0;
  z-index: 0;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 0 10px;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.step-item.active .step-number {
  background: #409eff;
  color: white;
}

.scene-content {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 20px;
}

.task-panel,
.terminal-panel,
.status-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  overflow: hidden;
}

.task-panel,
.status-panel {
  padding: 20px;
}

h3 {
  margin: 0 0 16px;
  color: #333;
  font-size: 16px;
}

/* 终端样式 */
.terminal-window {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
}

.terminal-header {
  background: #2d2d2d;
  padding: 8px 16px;
  display: flex;
  align-items: center;
}

.terminal-buttons {
  display: flex;
  gap: 8px;
}

.button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.button.red { background: #ff5f56; }
.button.yellow { background: #ffbd2e; }
.button.green { background: #27c93f; }

.terminal-title {
  margin-left: 16px;
  color: #9da5b4;
}

.terminal-body {
  flex: 1;
  padding: 16px;
  font-family: monospace;
  color: #fff;
  overflow-y: auto;
}

.output-line,
.input-line {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.prompt {
  color: #98c379;
}

input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-family: monospace;
  outline: none;
}

/* 状态面板样式 */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  color: #666;
}

.status-item.active {
  background: #e6f0ff;
  color: #409eff;
}

.error {
  color: #ff4d4f;
}
</style>
