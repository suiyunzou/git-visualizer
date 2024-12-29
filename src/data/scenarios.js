export default [
  {
    id: 'personal-dev',
    title: '个人开发场景',
    description: '学习个人开发中的基本 Git 操作',
    steps: [
      {
        id: 1,
        title: '初始化仓库',
        description: '创建一个新的 Git 仓库并添加初始文件',
        hint: '首先需要初始化一个Git仓库，这是进行版本控制的第一步',
        commandExamples: [
          {
            command: 'git init',
            description: '在当前目录初始化Git仓库'
          },
          {
            command: 'git status',
            description: '查看仓库当前状态'
          }
        ],
        tips: [
          '初始化后会创建一个隐藏的 .git 目录',
          '可以使用 ls -la 命令查看隐藏文件',
          '初始化后记得检查仓库状态'
        ],
        allowedCommands: ['git init', 'git status', 'ls'],
        expectedState: {
          hasGitInit: true
        }
      },
      {
        id: 2,
        title: '添加文件',
        description: '将新创建的文件添加到暂存区',
        hint: '使用 git add 命令添加文件',
        allowedCommands: ['git add', 'git status'],
        expectedState: {
          stagedFiles: ['*']
        }
      },
      {
        id: 3,
        title: '提交更改',
        description: '将暂存区的文件提交到仓库',
        hint: '使用 git commit 命令提交更改',
        allowedCommands: ['git commit'],
        expectedState: {
          hasCommit: true
        }
      }
    ]
  },
  {
    id: 'team-collaboration',
    title: '团队协作场景',
    description: '学习如何在团队中使用 Git 进行协作',
    steps: [
      {
        id: 1,
        title: '克隆项目',
        description: '克隆远程仓库到本地',
        hint: '使用 git clone 命令',
        allowedCommands: ['git clone'],
        initialState: {
          files: [],
          branches: ['main']
        },
        expectedState: {
          hasCloned: true
        }
      },
      {
        id: 2,
        title: '创建功能分支',
        description: '创建新分支开发功能',
        hint: '使用 git checkout -b 命令',
        allowedCommands: ['git checkout', 'git branch'],
        expectedState: {
          currentBranch: 'feature/*'
        }
      },
      {
        id: 3,
        title: '合并分支',
        description: '将功能分支合并回主分支',
        hint: '使用 git merge 命令',
        allowedCommands: ['git checkout', 'git merge'],
        expectedState: {
          currentBranch: 'main',
          mergedBranch: 'feature/*'
        }
      }
    ]
  },
  {
    id: 'conflict-resolution',
    title: '冲突解决场景',
    description: '学习如何处理合并冲突',
    steps: [
      {
        id: 1,
        title: '创建冲突',
        description: '在不同分支修改同一文件',
        hint: '在两个分支中修改同一个文件的相同位置',
        allowedCommands: ['git checkout', 'git branch', 'echo'],
        expectedState: {
          hasConflictingChanges: true
        }
      },
      {
        id: 2,
        title: '解决冲突',
        description: '解决合并冲突并提交更改',
        hint: '编辑冲突文件，然后使用 git add 和 git commit',
        allowedCommands: ['git add', 'git commit', 'git status'],
        expectedState: {
          conflictsResolved: true
        }
      }
    ]
  }
]
