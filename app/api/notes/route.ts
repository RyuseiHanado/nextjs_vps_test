import {NextRequest, NextResponse} from 'next/server';
import {PrismaClient} from '@prisma/client';
import {getFileList, uploadImage} from "@/app/repository/ImageRepository";

const prisma = new PrismaClient();

export async function GET() {
    const notes = await getAllNotes();
    return NextResponse.json(notes);
}

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const content = formData.get('content') as string
    const image = formData.get('image') as File

    const res = await prisma.notes.create({
        data: {
            content: content,
        },
    });

    if (image) await uploadImage(image, res.id);

    const notes = await getAllNotes();
    return NextResponse.json(notes);
}

export async function DELETE(request: NextRequest) {
    const id = parseInt(request.nextUrl.searchParams.get('id')!);

    await prisma.notes.delete({
        where: {
            id: id,
        },
    });

    const notes = await getAllNotes();
    return NextResponse.json(notes);
}

async function getAllNotes() {
    const notes = await prisma.notes.findMany();
    return await Promise.all(notes.map(async note => {
        let imageKey: string | null = null
        const res = await getFileList(note.id)
        if (res) {
            imageKey = res[0].Key!
        }
        return {...note, imageKey}
    }));
}