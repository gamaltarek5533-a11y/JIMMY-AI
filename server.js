const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
const GROQ_KEY = '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';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS_URL = 'https://api.groq.com/openai/v1/models';

// قائمة الموديلات بالأولوية — لو الأول وقف يجرب التاني تلقائي
const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
  'llama3-8b-8192'
];

var activeModel = MODELS[0];

function getDate() {
  return new Date().toLocaleDateString('ar-EG', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

// اكتشاف الموديل الشغال تلقائي عند بدء التشغيل
async function detectModel() {
  try {
    var fetch2 = require('node-fetch');
    var res = await fetch2(GROQ_MODELS_URL, {
      headers: { 'Authorization': 'Bearer ' + GROQ_KEY }
    });
    var data = await res.json();
    var available = (data.data || []).map(function(m) { return m.id; });
    for (var i = 0; i < MODELS.length; i++) {
      if (available.indexOf(MODELS[i]) !== -1) {
        activeModel = MODELS[i];
        console.log('✅ Model selected: ' + activeModel);
        return;
      }
    }
  } catch(e) {
    console.log('⚠️ Could not detect models, using default: ' + activeModel);
  }
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

app.post('/api/chat', async function(req, res) {
  try {
    var fetch2 = require('node-fetch');
    var messages = req.body.messages || [];
    var today = getDate();

    var SYSTEM = 'انت JIMMY مساعد ذكاء اصطناعي متطور وذكي جداً. تاريخ اليوم: ' + today + ' (عام 2026). تجيب بالعربية دائما ما لم يطلب المستخدم غير ذلك. متخصص في الكود والملفات والصور والرياضيات والعلوم. تفكر بعمق قبل الاجابة وتعطي اجابات دقيقة ومفصلة وصحيحة. عند كتابة كود استخدم code blocks مع اسم اللغة دائما.';

    var groqMessages = [{ role: 'system', content: SYSTEM }];
    messages.forEach(function(m) {
      var content = '';
      if (Array.isArray(m.content)) {
        m.content.forEach(function(p) {
          if (p.type === 'text') content += p.text + '\n';
          if (p.type === 'file') content += '\n--- ملف: ' + p.name + ' ---\n' + p.text + '\n---\n';
        });
      } else {
        content = m.content || '';
      }
      groqMessages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: content.trim() });
    });

    // جرّب الموديلات واحد واحد لو في مشكلة
    var lastError = '';
    for (var i = 0; i < MODELS.length; i++) {
      try {
        var result = await fetch2(GROQ_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_KEY },
          body: JSON.stringify({
            model: MODELS[i],
            messages: groqMessages,
            max_tokens: 8192,
            temperature: 0.6
          })
        });

        if (result.ok) {
          var data = await result.json();
          activeModel = MODELS[i];
          return res.json({ reply: data.choices[0].message.content, model: activeModel });
        } else {
          var errData = await result.json().catch(function(){ return {}; });
          lastError = errData.error ? errData.error.message : 'Error';
          // لو الموديل بس مش متاح جرّب التاني
          if (result.status === 400 || result.status === 404) continue;
          // لو خطأ تاني وقف
          return res.status(result.status).json({ error: lastError });
        }
      } catch(e) {
        lastError = e.message;
        continue;
      }
    }

    res.status(500).json({ error: 'كل الموديلات مش متاحة: ' + lastError });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/translate', async function(req, res) {
  try {
    var fetch2 = require('node-fetch');
    var result = await fetch2(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_KEY },
      body: JSON.stringify({
        model: activeModel,
        messages: [{ role: 'user', content: 'Translate this Arabic image prompt to detailed English for AI image generation. Return ONLY the English prompt:\n' + req.body.text }],
        max_tokens: 300,
        temperature: 0.5
      })
    });
    var data = await result.json();
    res.json({ eng: data.choices[0].message.content.trim() || req.body.text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/image', function(req, res) {
  var prompt = req.query.prompt || 'beautiful art';
  var seed = Date.now();
  res.json({
    url: 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt + ', high quality, 4k, detailed, professional, digital art') + '?width=1024&height=1024&nologo=true&enhance=true&seed=' + seed
  });
});

app.get('/api/health', function(req, res) {
  res.json({ status: 'ok', date: getDate(), model: activeModel });
});

// Serve main HTML file
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// تشغيل السيرفر
detectModel().then(function() {
  app.listen(PORT, function() {
    console.log('');
    console.log('✅ JIMMY AI ready => http://localhost:' + PORT);
    console.log('🧠 Model: ' + activeModel);
    console.log('📅 Date: ' + getDate());
    console.log('');
  });
});