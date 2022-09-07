import { ResultPoint } from './ResultPoint.interface';

export class Result {
    constructor(
        public user: {
            id: number
        },
        public context: {
            id: number,
            name?: string,
            contextType?: {
                id: number,
                name: string,
            },
        },
        public resultPoints: ResultPoint[],
        public created?: string,
        public device: {
            id: number,
            name: string
        } = { id: 1, name: 'Test' },
    ) { }
}
