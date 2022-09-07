import { User } from './User.interface';
import { Context } from './Context.class';

export class ContextSchedule {
    constructor(
        public user: User,
        public context: Context,
        public beginTimestamp: Date,
        public duration: number,
        public mandatory: boolean = false,
        public endTime?: Date,
        public id?: number,
        public image?: string
    ) {}
}
