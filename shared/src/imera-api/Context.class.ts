export class Context {
    id: number | undefined;
    contextType: {
        id?: number,
        name?: string
    };
    name: string | undefined;
    descriptionText: string | undefined;
    published: boolean;

    constructor(options: {
        id?: number,
        contextType?: {
            id?: number,
            name?: string
        },
        name?: string,
        descriptionText?: string,
        published?: boolean
    } = {}) {
        this.id = options.id,
            this.contextType = options.contextType || { id: 2, name: 'Fragebogen' },
            this.name = options.name,
            this.descriptionText = options.descriptionText,
            this.published = options.published || false
    }
}
