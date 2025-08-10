import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('mydb');
        const notes = await db.collection('notes').find().toArray();
        return Response.json(notes);
    } catch (error) {
        return Response.json({error: 'Failed to fetch notes'}, {status: 500});
    }
}

export async function POST(request) {
    try {
        const {text} = await request.json();
        const client = await clientPromise;
        const db = client.db('mydb');
        const result = await db.collection('notes').insertOne({text});
        return Response.json({_id: result.insertedId, text});
    } catch (error) {
        return Response.json({error: 'Failed to add note'}, {status: 500});
    }
}

export async function DELETE(request) {
    try {
        const {id} = await request.json();
        const client = await clientPromise;
        const db = client.db('mydb');
        await db.collection('notes').deleteOne({_id: new ObjectId(id)});
        return Response.json({message: 'Note deleted'});
    } catch (error) {
        return Response.json({error: 'Failed to delete note'}, {status: 500});
    }
}
