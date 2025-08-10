import { NextResponse } from 'next/server';

// These credentials are easier to leak, DO NOT USE!
export async function GET() {
    return NextResponse.json({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun.relay.metered.ca:80' },
            {
                urls: 'turn:global.relay.metered.ca:80',
                username: process.env.TURN_USERNAME,
                credential: process.env.TURN_CREDENTIAL,
            },
            {
                urls: 'turn:global.relay.metered.ca:80?transport=tcp',
                username: process.env.TURN_USERNAME,
                credential: process.env.TURN_CREDENTIAL,
            },
            {
                urls: 'turn:global.relay.metered.ca:443',
                username: process.env.TURN_USERNAME,
                credential: process.env.TURN_CREDENTIAL,
            },
            {
                urls: 'turns:global.relay.metered.ca:443?transport=tcp',
                username: process.env.TURN_USERNAME,
                credential: process.env.TURN_CREDENTIAL,
            },
        ]
    });
}