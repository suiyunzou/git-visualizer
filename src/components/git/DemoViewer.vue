<template>
  <div class="demo-viewer">
    <div class="demo-controls">
      <el-button type="primary" @click="startDemo" :disabled="isPlaying">
        <el-icon><VideoPlay /></el-icon>
        开始演示
      </el-button>
      <el-button @click="pauseDemo" :disabled="!isPlaying">
        <el-icon><VideoPause /></el-icon>
        暂停
      </el-button>
      <el-button @click="resetDemo" :disabled="isPlaying">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
    </div>

    <div class="demo-content">
      <!-- Git 命令演示区域 -->
      <div class="command-area">
        <div class="terminal">
          <div class="terminal-header">
            <div class="terminal-buttons">
              <span class="button red"></span>
              <span class="button yellow"></span>
              <span class="button green"></span>
            </div>
            <span class="terminal-title">Git 命令演示</span>
          </div>
          <div class="terminal-body">
            <div v-for="(line, index) in commandHistory" :key="index" class="command-line">
              <span class="prompt">$</span>
              <span :class="{ 'typing': line.isTyping }">{{ line.command }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Git 状态可视化区域 -->
      <div class="visualization-area">
        <div class="git-status">
          <div v-for="(state, index) in gitStates" 
               :key="index"
               class="state-node"
               :class="{ active: currentStep >= index }">
            {{ state.name }}
            <div class="state-description" v-if="currentStep >= index">
              {{ state.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { VideoPlay, VideoPause, Refresh } from '@element-plus/icons-vue'

const isPlaying = ref(false)
const currentStep = ref(0)
const commandHistory = ref([])
const demoInterval = ref(null)

const gitStates = [
  { name: '初始状态', description: '未初始化的目录' },
  { name: 'Git 初始化', description: '创建 .git 目录' },
  { name: '添加文件', description: '将文件添加到暂存区' },
  { name: '提交更改', description: '创建第一个提交' }
]

const demoCommands = [
  { command: 'git init', delay: 1000 },
  { command: 'echo "# Git Demo" > README.md', delay: 1500 },
  { command: 'git add README.md', delay: 1000 },
  { command: 'git commit -m "Initial commit"', delay: 2000 }
]

const typeCommand = async (command) => {
  const line = { command: '', isTyping: true }
  commandHistory.value.push(line)
  
  for (let char of command) {
    line.command += char
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  line.isTyping = false
}

const startDemo = async () => {
  if (isPlaying.value) return
  isPlaying.value = true
  
  for (let i = 0; i < demoCommands.length; i++) {
    await typeCommand(demoCommands[i].command)
    currentStep.value = i + 1
    await new Promise(resolve => setTimeout(resolve, demoCommands[i].delay))
  }
  
  isPlaying.value = false
}

const pauseDemo = () => {
  isPlaying.value = false
  if (demoInterval.value) {
    clearInterval(demoInterval.value)
    demoInterval.value = null
  }
}

const resetDemo = () => {
  pauseDemo()
  currentStep.value = 0
  commandHistory.value = []
}

onMounted(() => {
  // 初始化逻辑
})

onBeforeUnmount(() => {
  if (demoInterval.value) {
    clearInterval(demoInterval.value)
  }
})
</script>

<style lang="scss" scoped>
.demo-viewer {
  padding: 20px;

  .demo-controls {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
  }

  .demo-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .terminal {
    background: #1e1e1e;
    border-radius: 8px;
    overflow: hidden;

    .terminal-header {
      background: #323232;
      padding: 8px;
      display: flex;
      align-items: center;

      .terminal-buttons {
        display: flex;
        gap: 6px;
        margin-right: 10px;

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
      padding: 15px;
      min-height: 300px;
      font-family: 'Courier New', monospace;
    }
  }

  .command-line {
    color: #fff;
    margin: 8px 0;
    
    .prompt {
      color: #0f0;
      margin-right: 8px;
    }

    .typing {
      border-right: 2px solid #fff;
      animation: blink 1s step-end infinite;
    }
  }

  .git-status {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .state-node {
      padding: 15px;
      background: #f5f5f5;
      border-radius: 6px;
      opacity: 0.5;
      transition: all 0.3s ease;

      &.active {
        opacity: 1;
        background: #e1f5fe;
        border-left: 4px solid #03a9f4;
      }

      .state-description {
        margin-top: 8px;
        font-size: 14px;
        color: #666;
      }
    }
  }
}

@keyframes blink {
  0%, 100% { border-color: transparent; }
  50% { border-color: #fff; }
}
</style>
