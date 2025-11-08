import fs from 'node:fs'
import path from 'node:path'

import { Comment } from '../types/comment'

export default class CommentModel {
    private readonly dbPath: string
    private data: { comments: Comment[] }

    constructor() {
        this.dbPath = path.join(process.cwd(), 'database', 'comments.json')
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(path.dirname(this.dbPath), { recursive: true })
            fs.writeFileSync(this.dbPath, JSON.stringify({ comments: [] }, null, 2))
        }
        this.data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'))
    }

    private save() {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2))
    }

    listByProject(projectId: number): Comment[] {
        return this.data.comments
            .filter(c => c.projectId === projectId)
            .sort((a, b) => a.id - b.id)
    }

    add(c: Omit<Comment, 'id'>): Comment {
        const arr = this.data.comments
        const last = arr.length ? arr[arr.length - 1] : undefined
        const nextId = ((last && typeof last.id === 'number') ? last.id : 0) + 1

        const item: Comment = { id: nextId, ...c }
        this.data.comments.push(item)
        this.save()
        return item
    }

}
