const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/upload', upload.single('logFile'), async (req, res) => {

  try {

    const logContent = req.file.buffer.toString('utf-8');

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    const prompt = `
You are an expert DevOps engineer.

Analyze these logs and provide:
1. Errors detected
2. Possible causes
3. Suggested fixes
4. Security risks
5. Severity level

Logs:
${logContent}
`;

    try {

      // REAL AI RESPONSE

      const result = await model.generateContent(prompt);

      const response = result.response.text();

      return res.json({
        analysis: response,
        source: "Gemini AI"
      });

    } catch (aiError) {

      console.log("Gemini failed, using fallback AI");

      // SMART DEVOPS DETECTION

      let detectedIssues = [];
      let severity = "LOW";

      // JENKINS DETECTION

      if (
        logContent.includes("Jenkins") ||
        logContent.includes("pipeline failed")
      ) {
        detectedIssues.push("Jenkins CI/CD pipeline failure");
        severity = "MEDIUM";
      }

      // DOCKER DETECTION

      if (
        logContent.includes("Docker") ||
        logContent.includes("container crashed")
      ) {
        detectedIssues.push("Docker container crash detected");
        severity = "HIGH";
      }

      // KUBERNETES DETECTION

      if (
        logContent.includes("Kubernetes") ||
        logContent.includes("pod restart")
      ) {
        detectedIssues.push("Kubernetes pod instability");
        severity = "HIGH";
      }

      // NGINX DETECTION

      if (
        logContent.includes("502 Bad Gateway") ||
        logContent.includes("Nginx")
      ) {
        detectedIssues.push("Nginx reverse proxy failure");
        severity = "HIGH";
      }

      // MEMORY DETECTION

      if (
        logContent.includes("heap out of memory") ||
        logContent.includes("memory overflow")
      ) {
        detectedIssues.push("Application memory overflow");
        severity = "CRITICAL";
      }

      // SECURITY DETECTION

      if (
        logContent.includes("unauthorized") ||
        logContent.includes("access denied")
      ) {
        detectedIssues.push("Unauthorized access attempt detected");
        severity = "CRITICAL";
      }

      // DEFAULT ISSUE

      if (detectedIssues.length === 0) {
        detectedIssues.push("General infrastructure instability");
      }

      // FALLBACK AI REPORT

      const fallbackResponse = `
AI DEVOPS ANALYSIS REPORT

Detected Issues:
${detectedIssues.map(issue => `- ${issue}`).join('\n')}

Possible Causes:
- Missing dependencies
- Infrastructure instability
- Resource allocation issue
- Improper deployment configuration

Suggested Fixes:
- Verify deployment configuration
- Check Docker/Kubernetes logs
- Restart affected services
- Validate CI/CD pipeline
- Monitor system resources
- Enable automated rollback strategy

Security Risks:
- Potential service downtime
- Misconfigured deployment environment
- Unauthorized infrastructure access
- Increased operational instability

Severity Level:
- ${severity}

System Recommendation:
- Monitor logs continuously
- Enable automated alerts
- Implement rollback strategy
- Configure centralized log monitoring
- Use infrastructure health dashboards
`;

      return res.json({
        analysis: fallbackResponse,
        source: "Fallback AI Engine"
      });

    }

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Log analysis failed',
    });
  }
});

module.exports = router;