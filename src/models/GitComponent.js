export class GitComponent {
    constructor(id, type, metadata) {
        this.id = id;
        this.type = type;
        this.metadata = metadata;
        this.x = 0;
        this.y = 0;
    }

    static createCommit(message) {
        return new GitComponent(
            Date.now().toString(),
            'commit',
            {
                message,
                timestamp: new Date().toISOString(),
                hash: Math.random().toString(36).substring(2, 15)
            }
        );
    }

    static createBranch(name, source) {
        return new GitComponent(
            `branch-${Date.now()}`,
            'branch',
            {
                name,
                source: source.id,
                created: new Date().toISOString()
            }
        );
    }

    static createTag(name, target) {
        return new GitComponent(
            `tag-${Date.now()}`,
            'tag',
            {
                name,
                target: target.id,
                created: new Date().toISOString()
            }
        );
    }
}
