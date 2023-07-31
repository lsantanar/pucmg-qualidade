const mongo = require('mongodb')

class EventRepository {
    collection;

    constructor(collection) {
        this.collection = collection;
    }

    async deleteAll() {
        await this.collection.deleteMany({});
    }

    async deleteOne() {
        await this.collection.deleteMany({});
    }

    async create(event){
        await this.collection.insertOne(event);
        return event;
    }
    async findAll() {
        return (await this.collection.find({})).toArray();
    }

    async findById(id) {
        return await this.collection.findOne({_id: new mongo.ObjectId(id)})
    }

    async update(event) {
        await this.collection.updateOne({_id: event._id}, {$set: event});
    }

    async delete(event) {
        await this.collection.deleteOne({_id: event._id});
    }
}

module.exports = EventRepository;