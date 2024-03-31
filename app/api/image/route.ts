import {NextRequest, NextResponse} from "next/server";
import {load} from "ts-dotenv";
import {getFile} from "@/app/repository/ImageRepository";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    if (key) {
        const headers = new Headers();
        headers.set("Content-Type", "image/*");
        const res = await getFile(key)
        return new NextResponse(res, { status: 200, statusText: "OK", headers });
    }
}