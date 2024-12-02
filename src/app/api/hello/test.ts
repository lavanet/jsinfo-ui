export const dynamic = 'force-dynamic'; // static by default, unless reading the request

let counter = 0;
const processStartTime = new Date().toISOString();


export function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key') || '';

    counter += 1;

    return new Response(JSON.stringify({ key, counter, processStartTime }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}