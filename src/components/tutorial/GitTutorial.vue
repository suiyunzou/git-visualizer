<template>
  <app-layout>
    <div class="git-tutorial">
      <h1>Git 教程</h1>
      
      <el-tabs type="border-card" class="tutorial-tabs">
        <el-tab-pane label="Git 基础">
          <div class="tutorial-section">
            <h2>什么是 Git？</h2>
            <p>Git 是一个分布式版本控制系统，用于跟踪文件的变化。它可以帮助开发团队协同工作，管理代码版本。</p>
            
            <h3>核心概念</h3>
            <el-card class="concept-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Document /></el-icon>
                  <span>工作区（Working Directory）</span>
                </div>
              </template>
              <p>实际持有文件的目录，也就是你当前看到的文件内容。</p>
            </el-card>

            <el-card class="concept-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Plus /></el-icon>
                  <span>暂存区（Staging Area）</span>
                </div>
              </template>
              <p>临时保存你的改动的地方，使用 git add 命令将文件添加到暂存区。</p>
            </el-card>

            <el-card class="concept-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Box /></el-icon>
                  <span>版本库（Repository）</span>
                </div>
              </template>
              <p>Git 用来保存项目的元数据和对象数据库的地方，使用 git commit 命令将暂存区的内容提交到版本库。</p>
            </el-card>
          </div>
        </el-tab-pane>

        <el-tab-pane label="基本操作">
          <div class="tutorial-section">
            <h2>常用 Git 命令</h2>
            
            <el-timeline>
              <el-timeline-item
                v-for="command in basicCommands"
                :key="command.name"
                :type="command.type"
                :color="command.color"
              >
                <h3>{{ command.name }}</h3>
                <p class="command-code">$ {{ command.code }}</p>
                <p>{{ command.description }}</p>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-tab-pane>

        <el-tab-pane label="高级操作">
          <div class="tutorial-section">
            <h2>版本控制操作</h2>
            
            <div class="operations-grid">
              <el-card v-for="op in commonOperations" :key="op.title" class="operation-card">
                <template #header>
                  <div class="card-header">
                    <el-tag :type="op.type">{{ op.title }}</el-tag>
                  </div>
                </template>
                <p class="operation-desc">{{ op.description }}</p>
                <div class="command-group">
                  <div v-for="cmd in op.commands" :key="cmd.code" class="command-item">
                    <p class="command-code">$ {{ cmd.code }}</p>
                    <p class="command-desc">{{ cmd.desc }}</p>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="分支管理">
          <div class="tutorial-section">
            <h2>Git 分支</h2>
            <p>分支是 Git 的核心概念，它允许你从主开发线上分离出来，以免影响开发主线。</p>

            <div class="branch-types">
              <el-card v-for="branch in branchTypes" :key="branch.name" class="branch-card">
                <template #header>
                  <div class="card-header">
                    <el-tag :type="branch.tagType">{{ branch.name }}</el-tag>
                  </div>
                </template>
                <p>{{ branch.description }}</p>
                <div class="command-list">
                  <p v-for="cmd in branch.commands" :key="cmd" class="command-code">$ {{ cmd }}</p>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="最佳实践">
          <div class="tutorial-section">
            <h2>Git 最佳实践</h2>
            
            <el-collapse accordion>
              <el-collapse-item
                v-for="practice in bestPractices"
                :key="practice.title"
                :title="practice.title"
              >
                <div class="practice-content">
                  <p>{{ practice.description }}</p>
                  <ul v-if="practice.tips">
                    <li v-for="tip in practice.tips" :key="tip">{{ tip }}</li>
                  </ul>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </app-layout>
</template>

<script>
import { ref } from 'vue'
import AppLayout from '../common/AppLayout.vue'
import { Document, Plus, Box } from '@element-plus/icons-vue'

export default {
  name: 'GitTutorial',
  components: {
    AppLayout
  },

  setup() {
    const basicCommands = [
      {
        name: '初始化仓库',
        code: 'git init',
        description: '在当前目录创建一个新的 Git 仓库',
        type: 'primary',
        color: '#409EFF'
      },
      {
        name: '添加文件',
        code: 'git add <file>',
        description: '将文件添加到暂存区',
        type: 'success',
        color: '#67C23A'
      },
      {
        name: '提交更改',
        code: 'git commit -m "message"',
        description: '将暂存区的内容提交到版本库',
        type: 'warning',
        color: '#E6A23C'
      },
      {
        name: '查看状态',
        code: 'git status',
        description: '查看工作区和暂存区的状态',
        type: 'info',
        color: '#909399'
      }
    ]

    const branchTypes = [
      {
        name: '主分支（main）',
        tagType: 'warning',
        description: '主分支，包含生产环境的代码',
        commands: [
          'git checkout main',
          'git pull origin main'
        ]
      },
      {
        name: '特性分支（feature）',
        tagType: 'primary',
        description: '用于开发新功能的分支',
        commands: [
          'git checkout -b feature/new-feature',
          'git push origin feature/new-feature'
        ]
      },
      {
        name: '热修复分支（hotfix）',
        tagType: 'danger',
        description: '用于修复生产环境紧急问题的分支',
        commands: [
          'git checkout -b hotfix/bug-fix',
          'git push origin hotfix/bug-fix'
        ]
      },
      {
        name: '发布分支（release）',
        tagType: 'success',
        description: '用于准备发布新版本的分支',
        commands: [
          'git checkout -b release/v1.0.0',
          'git push origin release/v1.0.0'
        ]
      }
    ]

    const bestPractices = [
      {
        title: '提交信息规范',
        description: '编写清晰、描述性的提交信息有助于理解代码变更的目的。',
        tips: [
          '使用动词开头：add, update, fix, remove 等',
          '简明扼要地描述改动内容',
          '如果需要，可以在消息主体中添加详细说明'
        ]
      },
      {
        title: '分支管理策略',
        description: '采用规范的分支管理策略可以让团队协作更加顺畅。',
        tips: [
          '主分支应该始终保持可部署状态',
          '功能开发应在特性分支上进行',
          '定期将主分支的更新合并到特性分支'
        ]
      },
      {
        title: '代码审查',
        description: '在合并代码前进行代码审查可以提高代码质量。',
        tips: [
          '创建清晰的 Pull Request',
          '详细描述改动的目的和影响',
          '及时响应审查意见'
        ]
      }
    ]

    const commonOperations = [
      {
        title: '撤销修改',
        type: 'warning',
        description: '当你想要撤销文件的修改时，可以使用以下命令：',
        commands: [
          {
            code: 'git checkout -- <file>',
            desc: '撤销工作区中某个文件的修改'
          },
          {
            code: 'git restore <file>',
            desc: '撤销工作区中某个文件的修改（新版本 Git）'
          },
          {
            code: 'git reset HEAD <file>',
            desc: '撤销已暂存的文件（将文件从暂存区移回工作区）'
          },
          {
            code: 'git restore --staged <file>',
            desc: '撤销已暂存的文件（新版本 Git）'
          }
        ]
      },
      {
        title: '版本回退',
        type: 'danger',
        description: '当你需要回退到之前的版本时，可以使用以下命令：',
        commands: [
          {
            code: 'git reset --hard HEAD^',
            desc: '回退到上一个版本'
          },
          {
            code: 'git reset --hard HEAD^^',
            desc: '回退到上上个版本'
          },
          {
            code: 'git reset --hard <commit-id>',
            desc: '回退到指定的提交版本'
          },
          {
            code: 'git revert <commit-id>',
            desc: '创建一个新的提交来撤销某次提交的修改'
          }
        ]
      },
      {
        title: '暂存修改',
        type: 'info',
        description: '当你需要临时保存当前的修改时，可以使用以下命令：',
        commands: [
          {
            code: 'git stash',
            desc: '暂存当前的修改'
          },
          {
            code: 'git stash list',
            desc: '查看所有的暂存'
          },
          {
            code: 'git stash pop',
            desc: '恢复最近的一次暂存并删除暂存记录'
          },
          {
            code: 'git stash apply',
            desc: '恢复最近的一次暂存但保留暂存记录'
          }
        ]
      },
      {
        title: '查看历史',
        type: 'primary',
        description: '当你需要查看提交历史时，可以使用以下命令：',
        commands: [
          {
            code: 'git log',
            desc: '查看提交历史'
          },
          {
            code: 'git log --oneline',
            desc: '查看简洁的提交历史'
          },
          {
            code: 'git log --graph',
            desc: '以图形方式查看提交历史'
          },
          {
            code: 'git reflog',
            desc: '查看所有分支的所有操作记录'
          }
        ]
      },
      {
        title: '分支操作',
        type: 'success',
        description: '一些常用的分支操作命令：',
        commands: [
          {
            code: 'git branch -d <branch-name>',
            desc: '删除本地分支'
          },
          {
            code: 'git push origin --delete <branch-name>',
            desc: '删除远程分支'
          },
          {
            code: 'git branch -m <old-name> <new-name>',
            desc: '重命名分支'
          },
          {
            code: 'git checkout -b <new-branch> <existing-branch>',
            desc: '基于某个分支创建新分支'
          }
        ]
      },
      {
        title: '远程仓库',
        type: 'warning',
        description: '处理远程仓库的常用命令：',
        commands: [
          {
            code: 'git remote add origin <url>',
            desc: '添加远程仓库'
          },
          {
            code: 'git fetch origin',
            desc: '获取远程仓库的更新'
          },
          {
            code: 'git pull --rebase origin <branch>',
            desc: '拉取远程分支并rebase'
          },
          {
            code: 'git push -f origin <branch>',
            desc: '强制推送到远程分支（谨慎使用）'
          }
        ]
      }
    ]

    return {
      basicCommands,
      branchTypes,
      bestPractices,
      commonOperations
    }
  }
}
</script>

<style lang="scss" scoped>
.git-tutorial {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  h1 {
    margin-bottom: 24px;
    color: var(--text-primary);
  }

  .tutorial-tabs {
    margin-bottom: 40px;
    :deep(.el-tabs__content) {
      background: var(--card-background);
    }
  }

  .tutorial-section {
    padding: 20px;

    h2 {
      margin-bottom: 20px;
      color: var(--text-primary);
    }

    h3 {
      margin: 16px 0;
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      line-height: 1.6;
    }
  }

  .concept-card {
    margin-bottom: 16px;
    background: var(--card-background);
    border-color: var(--border-color);

    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .command-code {
    font-family: monospace;
    background: var(--background-secondary);
    padding: 8px 12px;
    border-radius: 4px;
    margin: 8px 0;
    color: var(--text-primary);
  }

  .branch-types {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 24px;
  }

  .branch-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .command-list {
      margin-top: 12px;
    }
  }

  .practice-content {
    padding: 12px 0;

    ul {
      margin-top: 12px;
      padding-left: 20px;

      li {
        color: var(--text-secondary);
        margin-bottom: 8px;
      }
    }
  }

  .operations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
    margin-top: 24px;
  }

  .operation-card {
    .operation-desc {
      margin-bottom: 16px;
      color: var(--text-secondary);
    }

    .command-group {
      .command-item {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .command-code {
          font-family: monospace;
          background: var(--background-secondary);
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 4px;
        }

        .command-desc {
          font-size: 14px;
          color: var(--text-secondary);
          padding-left: 8px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .git-tutorial {
    padding: 16px;

    .branch-types {
      grid-template-columns: 1fr;
    }

    .operations-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
