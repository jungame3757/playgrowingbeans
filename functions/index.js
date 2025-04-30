/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const { https } = require("firebase-functions");
const next = require("next");
const path = require("path");
const fs = require("fs");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Next.js 서버 설정
const dev = false; // 프로덕션 환경에서는 dev를 false로 설정
const nextjsServer = next({
  dev,
  conf: {
    distDir: ".next",
  },
  dir: __dirname, // 현재 함수 디렉토리를 기준으로 설정
});
const handle = nextjsServer.getRequestHandler();

// 서버 준비 상태를 저장
let nextjsServerPrepared = false;

// Firebase Functions를 통해 Next.js 서버 실행
exports.nextServer = https.onRequest({
  region: 'asia-northeast3'
}, async (req, res) => {
  try {
    if (!nextjsServerPrepared) {
      await nextjsServer.prepare();
      nextjsServerPrepared = true;
    }
    
    return handle(req, res);
  } catch (error) {
    console.error('Next.js 서버 실행 중 오류:', error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});
