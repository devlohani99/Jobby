const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const buildFallbackCoverLetter = ({ jobDetails = {}, userProfile = {} }) => {
    const title = jobDetails.title || 'the role';
    const company = jobDetails.company || 'your company';
    const description = jobDetails.description || 'the job requirements';
    const name = userProfile.name || 'Applicant';
    const role = userProfile.role || 'professional';
    const email = userProfile.email || '';

    const intro = `Dear Hiring Manager,\n\nI am excited to apply for the ${title} position at ${company}. As a ${role}, I am confident that my practical experience and problem-solving mindset align well with your team goals.`;
    const body = `\n\nFrom reviewing the role details, I understand that success in this position depends on delivering high-quality work, collaborating effectively, and learning quickly. I have consistently focused on these strengths in my previous projects and I am motivated to bring the same energy to ${company}.`;
    const fit = `\n\nThe opportunity to contribute to ${company} stands out to me because of the impact this role can create. My background and commitment to continuous improvement would allow me to add value while growing with your team.`;
    const close = email
        ? `\n\nThank you for your time and consideration. I would welcome the opportunity to discuss how I can contribute to your organization.\n\nSincerely,\n${name}\n${email}`
        : `\n\nThank you for your time and consideration. I would welcome the opportunity to discuss how I can contribute to your organization.\n\nSincerely,\n${name}`;

    return `${intro}${body}${fit}${close}`;
};

const createGroqClient = () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return null;
    }
    return new Groq({ apiKey });
};

router.post('/cover-letter', async (req, res) => {
    try {
        const { jobDetails, userProfile } = req.body;
        const groq = createGroqClient();

        const prompt = `
You are an expert career coach and cover letter writer. 
Write a professional, tailored, and engaging cover letter for the following job application.

Job Details:
- Title: ${jobDetails?.title || 'Not specified'}
- Company: ${jobDetails?.company || 'Not specified'}
- Description: ${jobDetails?.description || 'Not specified'}

Candidate Profile:
- Name: ${userProfile?.name || 'Applicant'}
- Role: ${userProfile?.role || 'Not specified'}
- Email: ${userProfile?.email || 'Not specified'}

Guidelines:
- Keep it concise, around 3-4 paragraphs.
- Be enthusiastic and professional.
- Highlight how the candidate's skills make them a great fit for the role.
- Do not include brackets like [Your Name] if the information is provided.
- Do not output anything except the cover letter text.
`;

        if (!groq) {
            const coverLetter = buildFallbackCoverLetter({ jobDetails, userProfile });
            return res.json({
                coverLetter,
                source: 'template'
            });
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama3-8b-8192',
            temperature: 0.7,
            max_tokens: 1024,
        });

        const coverLetter = chatCompletion.choices[0]?.message?.content || buildFallbackCoverLetter({ jobDetails, userProfile });

        res.json({ coverLetter, source: 'groq' });
    } catch (error) {
        console.error('Groq AI generation error:', error);
        const { jobDetails, userProfile } = req.body || {};
        const coverLetter = buildFallbackCoverLetter({ jobDetails, userProfile });
        res.json({ coverLetter, source: 'template' });
    }
});

module.exports = router;
