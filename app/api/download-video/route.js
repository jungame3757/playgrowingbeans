import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

// AWS S3 클라이언트 설정
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// S3 버킷 이름
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'growingbeansvideos';

export async function POST(request) {
  try {
    // 요청 데이터 파싱
    const { videoPath, fileName } = await request.json();

    // videoPath가 없는 경우 오류 반환
    if (!videoPath) {
      return NextResponse.json(
        { error: '비디오 경로가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 서명된 URL 생성
    // S3 키 생성 - videos/레벨1/1분기/레벨1 복습영상 3월 1주.mp4
    const s3Key = `videos/${videoPath}.mp4`;
    console.log('S3 요청 키:', s3Key);
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    });
    
    try {
      // 5분 유효한 서명된 URL 생성
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
      console.log('서명된 URL 생성 성공');
      
      // 클라이언트에게 서명된 URL 반환
      return NextResponse.json({ downloadUrl: signedUrl });
    } catch (signedUrlError) {
      console.error('서명된 URL 생성 실패:', signedUrlError);
      
      // 오류 정보 포함하여 응답
      return NextResponse.json(
        { 
          error: '비디오 다운로드 URL 생성 오류', 
          details: signedUrlError.message,
          requestedKey: s3Key
        },
        { status: 404 }
      );
    }

    /* 방식 2: 스트리밍 다운로드 (서버 부하가 큼)
    const s3Key = `videos/${videoPath}.mp4`;
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    });
    
    const response = await s3Client.send(command);
    
    if (!response.Body) {
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // S3 응답 스트림 처리
    const stream = Readable.fromWeb(response.Body);
    const chunks = [];
    
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    
    // 다운로드 응답 생성
    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': `attachment; filename=${encodeURIComponent(fileName)}`,
        'Content-Type': 'video/mp4',
        'Content-Length': buffer.length.toString()
      }
    });
    */
    
  } catch (error) {
    console.error('비디오 다운로드 오류:', error);
    return NextResponse.json(
      { error: '비디오 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 