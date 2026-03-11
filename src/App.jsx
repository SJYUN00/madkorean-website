import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Globe, Clock, Zap, Code, ChevronDown, CheckCircle, DollarSign, Smartphone, Monitor, Database, Package, Star, Send } from 'lucide-react';

// ── 전역 애니메이션 CSS 주입 ──
const injectStyles = () => {
  if (document.getElementById('mk-anim-styles')) return;
  const style = document.createElement('style');
  style.id = 'mk-anim-styles';
  style.textContent = `
    /* 스크롤 페이드인 */
    .mk-fade { opacity: 0; transform: translateY(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .mk-fade.visible { opacity: 1; transform: translateY(0); }
    .mk-fade-delay-1 { transition-delay: 0.1s; }
    .mk-fade-delay-2 { transition-delay: 0.2s; }
    .mk-fade-delay-3 { transition-delay: 0.3s; }

    /* 페이지 전환 fade */
    .mk-page { animation: mkPageIn 0.4s ease forwards; }
    @keyframes mkPageIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

    /* ripple 버튼 */
    .mk-ripple { position: relative; overflow: hidden; }
    .mk-ripple-wave { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.3); transform: scale(0); animation: mkRipple 0.6s linear; pointer-events: none; }
    @keyframes mkRipple { to { transform: scale(4); opacity: 0; } }

    /* 파티클 캔버스 */
    #mk-particles { position: absolute; inset: 0; pointer-events: none; }
  `;
  document.head.appendChild(style);
};

// ── Ripple 훅 ──
const useRipple = () => {
  const createRipple = useCallback((e) => {
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const rect = btn.getBoundingClientRect();
    circle.style.width = circle.style.height = diameter + 'px';
    circle.style.left = (e.clientX - rect.left - diameter / 2) + 'px';
    circle.style.top = (e.clientY - rect.top - diameter / 2) + 'px';
    circle.classList.add('mk-ripple-wave');
    btn.querySelector('.mk-ripple-wave')?.remove();
    btn.appendChild(circle);
  }, []);
  return createRipple;
};

// ── 스크롤 페이드인 훅 ──
const useFadeIn = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.mk-fade');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });
};

// ── 숫자 카운터 훅 ──
const useCounter = (target, duration = 1500, started = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    const isPercent = String(target).includes('%');
    const num = parseInt(String(target).replace(/[^0-9]/g, ''));
    if (isNaN(num)) return;
    let start = 0;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target]);
  return count;
};

// ── 번개 이펙트 컴포넌트 ──
const Particles = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const createBolt = () => {
      const x = canvas.width * (0.1 + Math.random() * 0.8);
      const segments = [];
      let cx = x, cy = -10;
      const totalH = canvas.height * (0.35 + Math.random() * 0.45);
      const steps = 12 + Math.floor(Math.random() * 10);
      for (let i = 0; i <= steps; i++) {
        segments.push({ x: cx, y: cy });
        cy += totalH / steps;
        cx += (Math.random() - 0.5) * 55;
      }

      // 가지: 메인 세그먼트 중간에서 분기
      const branches = [];
      if (Math.random() > 0.4) {
        const si = Math.floor(steps * 0.3 + Math.random() * steps * 0.35);
        let bx = segments[si].x, by = segments[si].y;
        const bsegs = [{ x: bx, y: by }];
        const bsteps = 4 + Math.floor(Math.random() * 4);
        for (let j = 0; j < bsteps; j++) {
          bx += (Math.random() - 0.5) * 40 + (Math.random() > 0.5 ? 15 : -15);
          by += 20 + Math.random() * 18;
          bsegs.push({ x: bx, y: by });
        }
        branches.push(bsegs);
      }

      return { segments, branches, alpha: 0, phase: 'in', holdTimer: 2 + Math.floor(Math.random() * 4) };
    };

    const drawPath = (segs, lineWidth, color, alpha, blur) => {
      if (segs.length < 2) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = blur;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      segs.forEach((s, i) => i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y));
      ctx.stroke();
      ctx.restore();
    };

    const drawBolt = (bolt) => {
      if (bolt.alpha <= 0) return;
      const { segments, branches, alpha } = bolt;

      // ── 주변 공간 플래시 효과 ──
      // 번개 중심 X 기준으로 radial gradient로 주변을 밝힘
      if (alpha > 0.05) {
        const midSeg = segments[Math.floor(segments.length / 2)];
        const flashIntensity = alpha * 0.13;
        const grad = ctx.createRadialGradient(midSeg.x, midSeg.y, 0, midSeg.x, midSeg.y, 320);
        grad.addColorStop(0, `rgba(180,40,40,${flashIntensity})`);
        grad.addColorStop(0.4, `rgba(120,20,20,${flashIntensity * 0.5})`);
        grad.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.save();
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        // 번개 상단(타격 시작점) 주변 강한 플래시
        const topSeg = segments[0];
        const topFlash = ctx.createRadialGradient(topSeg.x, topSeg.y, 0, topSeg.x, topSeg.y, 160);
        topFlash.addColorStop(0, `rgba(255,180,180,${alpha * 0.18})`);
        topFlash.addColorStop(0.5, `rgba(200,50,50,${alpha * 0.08})`);
        topFlash.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.save();
        ctx.fillStyle = topFlash;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        // 번개 끝점(땅 타격) 강한 임팩트 플래시
        const endSeg = segments[segments.length - 1];
        const endFlash = ctx.createRadialGradient(endSeg.x, endSeg.y, 0, endSeg.x, endSeg.y, 200);
        endFlash.addColorStop(0, `rgba(255,200,200,${alpha * 0.22})`);
        endFlash.addColorStop(0.3, `rgba(239,68,68,${alpha * 0.1})`);
        endFlash.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.save();
        ctx.fillStyle = endFlash;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // 1단계: 넓은 글로우 (가장 바깥)
      drawPath(segments, 8, 'rgba(239,68,68,1)', alpha * 0.07, 40);
      // 2단계: 중간 글로우
      drawPath(segments, 2.5, 'rgba(239,68,68,1)', alpha * 0.3, 16);
      // 3단계: 코어 (얇고 밝은 흰빛)
      drawPath(segments, 0.7, 'rgba(255,230,230,1)', alpha * 0.95, 4);

      branches.forEach(b => {
        drawPath(b, 4, 'rgba(239,68,68,1)', alpha * 0.05, 24);
        drawPath(b, 1.2, 'rgba(239,68,68,1)', alpha * 0.2, 8);
        drawPath(b, 0.4, 'rgba(255,220,220,1)', alpha * 0.7, 2);
      });
    };

    const bolts = [];
    let spawnTimer = 0;
    let nextSpawn = 50 + Math.random() * 90;
    let animId;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      spawnTimer++;
      if (spawnTimer > nextSpawn && bolts.length < 3) {
        bolts.push(createBolt());
        spawnTimer = 0;
        nextSpawn = 55 + Math.random() * 100;
      }

      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        if (b.phase === 'in') {
          b.alpha += 0.22;
          if (b.alpha >= 1) { b.alpha = 1; b.phase = 'hold'; }
        } else if (b.phase === 'hold') {
          // 미세 깜빡임
          b.alpha = 0.85 + Math.sin(Date.now() * 0.08) * 0.15;
          b.holdTimer--;
          if (b.holdTimer <= 0) b.phase = 'out';
        } else {
          b.alpha -= 0.06;
          if (b.alpha <= 0) { bolts.splice(i, 1); continue; }
        }
        drawBolt(b);
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} id="mk-particles" style={{ width: '100%', height: '100%' }} />;
};


const SHEET_ID = '1xC8EEsa4ec_H3ma1JdvMxMeO41CvCkOMpO0iJks-fek';

// ── Google Analytics 이벤트 헬퍼 ──
const gaEvent = (eventName, params) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};
const gaPageView = (pageName) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', { page_title: pageName, page_location: window.location.href });
  }
};

const fallbackContent = {
  en: {
    nav: { home: 'Home', portfolio: 'Portfolio', process: 'Process', contact: 'Contact' },
    hero: { title1: 'Madly Fast.', title2: 'Madly Precise.', title3: 'Madly Korean.', subtitle: "We don't just code. We are obsessed with perfection.", cta: 'Start Your Project' },
    engine: { title: 'The 24/7 Engine', subtitle: 'We Build While You Sleep', description: "When it's evening in the US, it's morning in Korea. The feedback you submit before leaving work is already implemented before you arrive the next day.", stat1: '≤ 12hr', stat1Label: 'Turnaround Time', stat2: '100%', stat2Label: 'Real-time Updates', stat3: '24/7', stat3Label: 'Development Cycle' },
    obsession: { title: 'Our Obsession', subtitle: "Why We're Different", point1Title: 'Elite Engineering', point1Desc: 'Korean developers are among the most rigorously educated in the world.', point2Title: 'Clean Code Standard', point2Desc: 'Every line is documented, tested, and built to scale.', point3Title: 'Obsessive Detail', point3Desc: "We treat your project like it's ours." },
    portfolio: { title: 'Our Work', subtitle: 'Real Problems. Real Solutions.' },
    process: { title: 'Development Process', subtitle: 'How We Turn Ideas Into Reality' },
    testimonials: { title: 'Client Success Stories', subtitle: 'What Our Clients Say' },
    faq: { title: 'Frequently Asked Questions', subtitle: 'Everything you need to know' },
    contact: { title: 'Start Your Project', subtitle: "Let's build something extraordinary together", namePlaceholder: 'Your Name', emailPlaceholder: 'Email Address', companyPlaceholder: 'Company Name (Optional)', budgetLabel: 'Budget Range', devTypeLabel: 'Development Type', messagePlaceholder: 'Tell us about your project...', submitButton: 'Send Message' },
    cta: { title: 'Ready to Experience Mad Korean Quality?', subtitle: "Let's build something extraordinary together.", button: 'Get Started', email: 'madkoreandev@gmail.com' }
  },
  ko: {
    nav: { home: '홈', portfolio: '포트폴리오', process: '프로세스', contact: '연락하기' },
    hero: { title1: '미친듯이 빠르게.', title2: '미친듯이 정확하게.', title3: '미친듯이 한국적으로.', subtitle: '우리는 단순히 코딩하지 않습니다. 완벽함에 집착합니다.', cta: '프로젝트 시작하기' },
    engine: { title: '24/7 엔진', subtitle: '당신이 자는 동안 우리는 만듭니다', description: '미국이 저녁일 때 한국은 아침입니다. 퇴근 전 남긴 피드백은 다음날 출근 전 이미 구현되어 있습니다.', stat1: '≤ 12시간', stat1Label: '피드백 반영', stat2: '100%', stat2Label: '실시간 업데이트', stat3: '24/7', stat3Label: '개발 사이클' },
    obsession: { title: '우리의 집착', subtitle: '왜 우리가 다른가', point1Title: '엘리트 엔지니어링', point1Desc: '한국 개발자들은 세계에서 가장 엄격한 교육을 받습니다.', point2Title: '클린 코드 기준', point2Desc: '모든 라인은 문서화되고, 테스트되며, 확장 가능하게 작성됩니다.', point3Title: '집요한 디테일', point3Desc: '당신의 프로젝트를 우리 것처럼 다룹니다.' },
    portfolio: { title: '우리의 작업물', subtitle: '실제 문제. 실제 솔루션.' },
    process: { title: '개발 프로세스', subtitle: '아이디어를 현실로 만드는 방법' },
    testimonials: { title: '고객 성공 사례', subtitle: '고객들의 이야기' },
    faq: { title: '자주 묻는 질문', subtitle: '알아야 할 모든 것' },
    contact: { title: '프로젝트 시작하기', subtitle: '함께 특별한 것을 만들어봅시다', namePlaceholder: '이름', emailPlaceholder: '이메일 주소', companyPlaceholder: '회사명 (선택)', budgetLabel: '예산 범위', devTypeLabel: '개발 유형', messagePlaceholder: '프로젝트에 대해 알려주세요...', submitButton: '메시지 보내기' },
    cta: { title: 'Mad Korean의 품질을 경험할 준비가 되셨나요?', subtitle: '함께 특별한 것을 만들어봅시다.', button: '시작하기', email: 'madkoreandev@gmail.com' }
  }
};

const fallbackTestimonials = [
  { name_en: 'Sarah Johnson', name_ko: 'Sarah Johnson', company: 'TechCorp Inc.', role_en: 'CTO', role_ko: 'CTO', text_en: "Mad Korean delivered our mobile app ahead of schedule with exceptional quality. The time zone difference actually worked in our favor - we'd wake up to progress every morning!", text_ko: "Mad Korean은 예상보다 빠르게 뛰어난 품질의 모바일 앱을 제공했습니다. 시차가 오히려 우리에게 유리하게 작용했어요 - 매일 아침 일어나면 진행 상황을 확인할 수 있었습니다!", rating: 5 },
  { name_en: 'Michael Chen', name_ko: 'Michael Chen', company: 'StartupXYZ', role_en: 'Founder & CEO', role_ko: '창업자 & CEO', text_en: "The technical expertise and communication were outstanding. They didn't just code what we asked for - they improved our ideas with their engineering insights.", text_ko: "기술 전문성과 소통이 뛰어났습니다. 단순히 요청한 것만 코딩하는 게 아니라 엔지니어링 인사이트로 우리 아이디어를 개선해주었어요.", rating: 5 },
  { name_en: 'Emma Rodriguez', name_ko: 'Emma Rodriguez', company: 'E-commerce Solutions', role_en: 'Product Manager', role_ko: '프로덕트 매니저', text_en: "Best development partner we've worked with. Clean code, thorough documentation, and a genuine obsession with quality. Highly recommended!", text_ko: "함께 일한 최고의 개발 파트너입니다. 깨끗한 코드, 철저한 문서화, 그리고 품질에 대한 진정한 집착. 강력 추천합니다!", rating: 5 }
];

const fallbackFaqs = [
  { q_en: "How does the time zone difference work?", q_ko: "시차는 어떻게 작동하나요?", a_en: "When it's evening in the US (5 PM PST), it's morning in Korea (9 AM KST). You submit feedback before leaving work, and we implement it overnight. You wake up to progress - it's like having a 24-hour development cycle.", a_ko: "미국이 저녁 5시(PST)일 때 한국은 오전 9시(KST)입니다. 퇴근 전 피드백을 주시면 밤새 구현합니다. 아침에 일어나면 진행 상황을 확인하실 수 있어요 - 마치 24시간 개발 사이클 같습니다." },
  { q_en: "What is your typical project timeline?", q_ko: "일반적인 프로젝트 타임라인은 어떻게 되나요?", a_en: "It depends on scope, but we typically deliver MVPs in 4-8 weeks and full applications in 3-6 months. Our 24/7 cycle means we're often 30-40% faster than agencies in your timezone.", a_ko: "범위에 따라 다르지만, 일반적으로 MVP는 4-8주, 완전한 애플리케이션은 3-6개월 안에 제공합니다. 24/7 사이클 덕분에 같은 시간대의 에이전시보다 30-40% 빠릅니다." },
  { q_en: "Do you provide ongoing support after launch?", q_ko: "출시 후 지속적인 지원을 제공하나요?", a_en: "Yes! We offer flexible maintenance plans including bug fixes, feature updates, and technical support. Many clients keep us on retainer for continuous improvement.", a_ko: "네! 버그 수정, 기능 업데이트, 기술 지원을 포함한 유연한 유지보수 플랜을 제공합니다. 많은 고객들이 지속적인 개선을 위해 우리를 고용하고 있습니다." },
  { q_en: "How do you ensure code quality?", q_ko: "코드 품질을 어떻게 보장하나요?", a_en: "Every line goes through peer review, automated testing, and quality checks. We follow industry best practices, write comprehensive documentation, and ensure all code is production-ready and scalable.", a_ko: "모든 라인은 동료 검토, 자동화 테스트, 품질 검사를 거칩니다. 업계 모범 사례를 따르고, 포괄적인 문서를 작성하며, 모든 코드가 프로덕션 준비되고 확장 가능하도록 보장합니다." },
  { q_en: "What technologies do you work with?", q_ko: "어떤 기술을 사용하나요?", a_en: "We're technology-agnostic and choose the best stack for your needs. Common choices include React/Next.js, Node.js, Python, PostgreSQL, AWS, and mobile frameworks like React Native or Flutter.", a_ko: "기술에 구애받지 않으며 필요에 맞는 최고의 스택을 선택합니다. React/Next.js, Node.js, Python, PostgreSQL, AWS, React Native 또는 Flutter 같은 모바일 프레임워크를 많이 사용합니다." },
  { q_en: "How much does a project typically cost?", q_ko: "프로젝트 비용은 일반적으로 얼마인가요?", a_en: "Projects range from $20K for MVPs to $200K+ for complex enterprise applications. We provide detailed quotes after understanding your requirements. Korean development rates offer premium quality at competitive prices.", a_ko: "프로젝트는 MVP의 경우 $20K부터 복잡한 엔터프라이즈 애플리케이션의 경우 $200K 이상까지 다양합니다. 요구사항을 파악한 후 상세한 견적을 제공합니다. 한국 개발 비용은 경쟁력 있는 가격으로 프리미엄 품질을 제공합니다." }
];

// ────────────────────────────────────────────────
// ContactPage — 최상위 레벨 컴포넌트로 분리 (input 버그 핵심 수정)
// ────────────────────────────────────────────────
const ContactPage = ({ t, language, onNavigate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', budget: '', devType: [], message: '' });
  const [estimatorData, setEstimatorData] = useState({ projectType: '', complexity: '', addons: [] });

  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, devType: checked ? [...prev.devType, value] : prev.devType.filter(t => t !== value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    // GA 전환 이벤트
    gaEvent('form_submit', { form_name: 'contact_form', budget: formData.budget, dev_type: formData.devType.join(',') });
    gaEvent('conversion', { send_to: 'contact_form_submission' });
    const mailto = `mailto:madkoreandev@gmail.com?subject=New Project Inquiry from ${formData.name}&body=Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0ACompany: ${formData.company}%0D%0ABudget: ${formData.budget}%0D%0ADevelopment Type: ${formData.devType.join(', ')}%0D%0A%0D%0AMessage:%0D%0A${formData.message}`;
    window.location.href = mailto;
  }, [formData]);

  const estimate = useMemo(() => {
    const { projectType, complexity, addons } = estimatorData;
    if (!projectType || !complexity) return null;
    const baseRanges = {
      mobile: { simple: [10000, 15000], medium: [15000, 25000], complex: [25000, 40000] },
      web: { simple: [5000, 8000], medium: [8000, 15000], complex: [15000, 25000] },
      'web+mobile': { simple: [15000, 20000], medium: [20000, 35000], complex: [35000, 55000] },
      erp: { simple: [20000, 30000], medium: [30000, 50000], complex: [50000, 80000] }
    };
    const timelineRanges = { mobile: '8-12 weeks', web: '6-10 weeks', 'web+mobile': '10-14 weeks', erp: '10-16 weeks' };
    const addonCosts = { animations: [2000, 5000], api: [2000, 8000], payment: [3000, 5000], ai: [4000, 10000], realtime: [3000, 8000], analytics: [2500, 6000], security: [2000, 5000] };
    let [minCost, maxCost] = baseRanges[projectType][complexity];
    addons.forEach(addon => { minCost += addonCosts[addon][0]; maxCost += addonCosts[addon][1]; });
    return { min: minCost.toLocaleString(), max: maxCost.toLocaleString(), timeline: timelineRanges[projectType] };
  }, [estimatorData]);

  const ripple = useRipple();
  useFadeIn();
  useEffect(() => { injectStyles(); }, []);

  return (
    <section className="mk-page py-32 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 pt-20 mk-fade">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t?.contact?.title || 'Start Your Project'}</h1>
          <p className="text-xl text-gray-400">{t?.contact?.subtitle || "Let's build something extraordinary together"}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Project Estimator */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-2 text-red-500">Project Estimator</h2>
            <p className="text-gray-400 mb-8">Get an instant estimate for your project</p>
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3">Project Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ value: 'mobile', label: 'Mobile App', icon: '📱' }, { value: 'web', label: 'Web App', icon: '💻' }, { value: 'web+mobile', label: 'Web + Mobile', icon: '🌐' }, { value: 'erp', label: 'ERP/CRM', icon: '📊' }].map(type => (
                    <button key={type.value} onClick={() => { setEstimatorData(prev => ({ ...prev, projectType: type.value, complexity: '', addons: [] })); gaEvent('estimator_project_type', { project_type: type.value }); }}
                      className={`p-4 rounded-lg border-2 transition ${estimatorData.projectType === type.value ? 'border-red-500 bg-red-500/10' : 'border-gray-700 hover:border-red-500/50'}`}>
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-sm font-semibold text-white">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              {estimatorData.projectType && (
                <div>
                  <label className="block text-white font-semibold mb-3">Complexity</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ value: 'simple', label: 'Simple' }, { value: 'medium', label: 'Medium' }, { value: 'complex', label: 'Complex' }].map(comp => (
                      <button key={comp.value} onClick={() => { setEstimatorData(prev => ({ ...prev, complexity: comp.value })); gaEvent('estimator_complexity', { complexity: comp.value, project_type: estimatorData.projectType }); }}
                        className={`p-3 rounded-lg border-2 transition ${estimatorData.complexity === comp.value ? 'border-red-500 bg-red-500/10' : 'border-gray-700 hover:border-red-500/50'}`}>
                        <div className="text-sm font-semibold text-white">{comp.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {estimatorData.complexity && (
                <div>
                  <label className="block text-white font-semibold mb-3">Add-ons (Optional)</label>
                  <div className="space-y-2">
                    {[
                      { value: 'animations', label: 'Premium Animations & Effects', cost: '+$2K-$5K' },
                      { value: 'api', label: 'API Integrations', cost: '+$2K-$8K' },
                      { value: 'payment', label: 'Payment Gateway', cost: '+$3K-$5K' },
                      { value: 'ai', label: 'AI/ML Features', cost: '+$4K-$10K' },
                      { value: 'realtime', label: 'Real-time Capabilities', cost: '+$3K-$8K' },
                      { value: 'analytics', label: 'Analytics Dashboard', cost: '+$2.5K-$6K' },
                      { value: 'security', label: 'Enhanced Security', cost: '+$2K-$5K' }
                    ].map(addon => (
                      <label key={addon.value} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={estimatorData.addons.includes(addon.value)}
                            onChange={(e) => setEstimatorData(prev => ({ ...prev, addons: e.target.checked ? [...prev.addons, addon.value] : prev.addons.filter(a => a !== addon.value) }))}
                            className="w-5 h-5 text-red-500 bg-gray-900 border-gray-700 rounded focus:ring-red-500" />
                          <span className="text-white text-sm">{addon.label}</span>
                        </div>
                        <span className="text-gray-400 text-xs">{addon.cost}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {estimate && (
                <div className="mt-8 p-6 bg-gradient-to-br from-red-900/20 to-black border border-red-500 rounded-lg">
                  <div className="text-center mb-4">
                    <div className="text-gray-400 text-sm mb-2">💰 Estimated Investment</div>
                    <div className="text-4xl font-bold text-red-500">${estimate.min} - ${estimate.max}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                    <div><div className="text-gray-400 text-xs mb-1">⏱️ Timeline</div><div className="text-white font-semibold">{estimate.timeline}</div></div>
                    <div><div className="text-gray-400 text-xs mb-1">✓ Included</div><div className="text-white font-semibold">Custom Design</div></div>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <p className="text-gray-400 text-sm text-center mb-3">✓ Full documentation<br/>✓ 24/7 development cycle<br/>✓ Post-launch support</p>
                    <p className="text-red-400 italic text-center text-sm font-semibold">"Turning your expenses into investments..."</p>
                  </div>
                  <button onClick={() => { document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="w-full mt-4 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition">
                    Get Detailed Quote →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-red-500 mb-4">Why Mad Korean?</h3>
              <div className="space-y-4">
                {[
                  { title: 'Custom Design. Always.', desc: "We don't use templates. Every project is built from scratch to match your vision." },
                  { title: '50% Less Than US Agencies', desc: 'Premium Korean engineering at competitive prices.' },
                  { title: 'The 24/7 Engine', desc: 'While you sleep, we build. Wake up to progress every morning.' },
                  { title: 'No Hidden Fees', desc: 'Transparent pricing. What you see is what you get.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
                    <div><div className="font-semibold text-white mb-1">{item.title}</div><div className="text-gray-400 text-sm">{item.desc}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">What's Included</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {['✓ Custom UI/UX Design', '✓ Clean Code', '✓ Full Documentation', '✓ Quality Assurance', '✓ Deployment Support', '✓ 30-day Bug Fixes', '✓ Source Code Ownership', '✓ Real-time Updates'].map((item, i) => (
                  <div key={i} className="text-gray-300">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div id="contact-form" className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Ready to Start?</h2>
            <p className="text-gray-400">Fill out the form below and we'll get back to you within 24 hours</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder={t?.contact?.namePlaceholder || 'Your Name'} required
              className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition" />
            <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder={t?.contact?.emailPlaceholder || 'Email Address'} required
              className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition" />
            <input type="text" name="company" value={formData.company} onChange={handleFormChange} placeholder={t?.contact?.companyPlaceholder || 'Company Name (Optional)'}
              className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition" />
            <div>
              <label className="block text-gray-400 mb-3">{t?.contact?.budgetLabel || 'Budget Range'}</label>
              <select name="budget" value={formData.budget} onChange={handleFormChange} required
                className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-lg text-white focus:border-red-500 focus:outline-none transition">
                <option value="">Select budget range</option>
                <option value="< $20K">&lt; $20K</option>
                <option value="$20K - $50K">$20K - $50K</option>
                <option value="$50K - $100K">$50K - $100K</option>
                <option value="$100K - $200K">$100K - $200K</option>
                <option value="$200K+">$200K+</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-3">{t?.contact?.devTypeLabel || 'Development Type'} (Select all that apply)</label>
              <div className="grid md:grid-cols-2 gap-4">
                {[{ value: 'mobile', label: 'Mobile App', icon: Smartphone }, { value: 'web', label: 'Web Application', icon: Monitor }, { value: 'erp', label: 'ERP System', icon: Database }, { value: 'crm', label: 'CRM System', icon: Package }, { value: 'ecommerce', label: 'E-commerce', icon: DollarSign }, { value: 'other', label: 'Other', icon: Code }].map(({ value, label, icon: Icon }) => (
                  <label key={value} className="flex items-center gap-3 px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg cursor-pointer hover:border-red-500/50 transition">
                    <input type="checkbox" name="devType" value={value} checked={formData.devType.includes(value)} onChange={handleFormChange}
                      className="w-5 h-5 text-red-500 bg-gray-900 border-gray-700 rounded focus:ring-red-500" />
                    <Icon size={20} className="text-red-500" />
                    <span className="text-white">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <textarea name="message" value={formData.message} onChange={handleFormChange} placeholder={t?.contact?.messagePlaceholder || 'Tell us about your project...'} required rows={6}
              className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition resize-none" />
            <button type="submit" onClick={ripple} className="mk-ripple w-full px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2">
              <Send size={20} />
              {t?.contact?.submitButton || 'Send Message'}
            </button>
          </form>
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-2">or email us directly at</p>
            <a href="mailto:madkoreandev@gmail.com" className="text-red-500 hover:text-red-400 font-semibold text-lg">madkoreandev@gmail.com</a>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── 숫자 카운터 카드 ──
const StatCard = ({ stat, label, delay }) => {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const statStr = String(stat || '');

  // "24/7", "≤ 12hr" 같은 특수 포맷 감지 → 카운터 건너뛰고 원본 표시
  const hasSlash = statStr.includes('/');
  const hasSpecialChar = /[≤≥<>]/.test(statStr);
  const skipCounter = hasSlash || hasSpecialChar;

  // 카운터용: 순수 숫자만 추출 (슬래시/특수문자 없을 때만)
  const numMatch = !skipCounter ? statStr.match(/\d+/) : null;
  const num = numMatch ? parseInt(numMatch[0]) : 0;
  const prefix = !skipCounter ? statStr.slice(0, numMatch?.index || 0) : '';
  const suffix = !skipCounter && numMatch ? statStr.slice(numMatch.index + numMatch[0].length) : '';
  const count = useCounter(num, 1500, started && !skipCounter);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const displayValue = skipCounter
    ? statStr  // 원본 그대로
    : (started ? `${prefix}${count}${suffix}` : `${prefix}0${suffix}`);

  return (
    <div ref={ref} className={`mk-fade mk-fade-delay-${delay} bg-black/50 border border-red-500/30 rounded-lg p-8 text-center hover:border-red-500 transition-all duration-300 transform hover:scale-105`}>
      <div className="text-5xl font-bold text-red-500 mb-2">{displayValue}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
};

// ────────────────────────────────────────────────
// HomePage
// ────────────────────────────────────────────────
const HomePage = ({ t, language, scrollY, testimonials, faqs, onNavigate }) => {
  const ripple = useRipple();
  useFadeIn();

  useEffect(() => { injectStyles(); }, []);

  return (
  <div className="mk-page">
    {/* Hero */}
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      <Particles />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #dc2626 0%, transparent 50%)', transform: `translateY(${scrollY * 0.5}px)` }} />
      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
          <div className="text-white mb-2" style={{ animation: 'mkPageIn 0.6s ease 0.1s both' }}>{t?.hero?.title1 || 'Madly Fast.'}</div>
          <div className="text-white mb-2" style={{ animation: 'mkPageIn 0.6s ease 0.3s both' }}>{t?.hero?.title2 || 'Madly Precise.'}</div>
          <div className="text-red-500" style={{ animation: 'mkPageIn 0.6s ease 0.5s both' }}>{t?.hero?.title3 || 'Madly Korean.'}</div>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto" style={{ animation: 'mkPageIn 0.6s ease 0.7s both' }}>{t?.hero?.subtitle}</p>
        <button
          onClick={(e) => { ripple(e); onNavigate('contact'); gaEvent('cta_click', { button: 'start_your_project', location: 'hero' }); }}
          className="mk-ripple inline-block px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-full transition transform hover:scale-105"
          style={{ animation: 'mkPageIn 0.6s ease 0.9s both' }}>
          {t?.hero?.cta || 'Start Your Project'}
        </button>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown size={32} className="text-red-500" />
        </div>
      </div>
    </section>

    {/* 24/7 Engine */}
    <section className="py-32 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 mk-fade">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">{t?.engine?.title || 'The 24/7 Engine'}</h2>
          <p className="text-2xl text-red-500 font-semibold">{t?.engine?.subtitle || 'We Build While You Sleep'}</p>
        </div>
        <p className="text-xl text-gray-300 text-center max-w-4xl mx-auto mb-16 leading-relaxed mk-fade">{t?.engine?.description}</p>
        <div className="grid md:grid-cols-3 gap-8">
          {['stat1', 'stat2', 'stat3'].map((stat, i) => (
            <StatCard key={i} stat={t?.engine?.[stat] || '0'} label={t?.engine?.[`${stat}Label`]} delay={i + 1} />
          ))}
        </div>
      </div>
    </section>

    {/* Obsession */}
    <section className="py-32 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 mk-fade">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">{t?.obsession?.title || 'Our Obsession'}</h2>
          <p className="text-xl text-gray-400">{t?.obsession?.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {[{ icon: Code, key: 'point1' }, { icon: Zap, key: 'point2' }, { icon: Clock, key: 'point3' }].map(({ icon: Icon, key }, i) => (
            <div key={i} className={`text-center group mk-fade mk-fade-delay-${i + 1}`}>
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-500/20 transition">
                <Icon size={40} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t?.obsession?.[`${key}Title`]}</h3>
              <p className="text-gray-400 leading-relaxed">{t?.obsession?.[`${key}Desc`]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="py-32 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 mk-fade">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">{t?.testimonials?.title || 'Client Success Stories'}</h2>
          <p className="text-xl text-gray-400">{t?.testimonials?.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <div key={i} className={`mk-fade mk-fade-delay-${i + 1} bg-gray-900/50 border border-gray-800 rounded-lg p-8 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105`}>
              <div className="flex gap-1 mb-4">{[...Array(item.rating)].map((_, j) => <Star key={j} size={20} className="fill-red-500 text-red-500" />)}</div>
              <p className="text-gray-300 mb-6 leading-relaxed italic">"{language === 'en' ? item.text_en : item.text_ko}"</p>
              <div className="border-t border-gray-700 pt-4">
                <p className="font-bold text-white">{language === 'en' ? item.name_en : item.name_ko}</p>
                <p className="text-sm text-gray-500">{language === 'en' ? item.role_en : item.role_ko}, {item.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="py-32 bg-black">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 mk-fade">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">{t?.faq?.title || 'Frequently Asked Questions'}</h2>
          <p className="text-xl text-gray-400">{t?.faq?.subtitle}</p>
        </div>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="mk-fade bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-red-500/50 transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 text-red-500">{language === 'en' ? faq.q_en : faq.q_ko}</h3>
              <p className="text-gray-400 leading-relaxed">{language === 'en' ? faq.a_en : faq.a_ko}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Bottom CTA */}
    <section className="py-32 bg-gradient-to-t from-red-950/20 to-black">
      <div className="max-w-4xl mx-auto px-6 text-center mk-fade">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">{t?.cta?.title}</h2>
        <p className="text-2xl text-gray-400 mb-12">{t?.cta?.subtitle}</p>
        <button
          onClick={(e) => { ripple(e); onNavigate('contact'); gaEvent('cta_click', { button: 'get_started', location: 'bottom_cta' }); }}
          className="mk-ripple inline-block px-12 py-5 bg-red-500 hover:bg-red-600 text-white font-bold text-xl rounded-full transition transform hover:scale-105 mb-6">
          {t?.cta?.button || 'Get Started'}
        </button>
        <p className="text-gray-500">{t?.cta?.email}</p>
      </div>
    </section>
  </div>
  );
};

// ────────────────────────────────────────────────
// PortfolioPage
// ────────────────────────────────────────────────
const PortfolioPage = ({ t, language, portfolio }) => {
  useFadeIn();
  useEffect(() => { injectStyles(); }, []);
  return (
    <section className="mk-page py-32 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 pt-20 mk-fade">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t?.portfolio?.title}</h1>
          <p className="text-xl text-gray-400">{t?.portfolio?.subtitle}</p>
        </div>
        <div className="space-y-24">
          {portfolio.map((project, i) => (
            <div key={i} className="mk-fade grid md:grid-cols-2 gap-12 items-center">
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                {project.image && (
                  <div className="rounded-lg overflow-hidden border border-gray-800 hover:border-red-500 transition">
                    <img src={project.image} alt={language === 'en' ? project.title_en : project.title_ko} className="w-full h-auto" loading="lazy" />
                  </div>
                )}
              </div>
              <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                <h3 className="text-3xl font-bold mb-4">{language === 'en' ? project.title_en : project.title_ko}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">{language === 'en' ? project.desc_en : project.desc_ko}</p>
                {project.tech && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Tech Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.split(',').map((tech, idx) => <span key={idx} className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-sm text-red-400">{tech.trim()}</span>)}
                    </div>
                  </div>
                )}
                {(project.challenge_en || project.challenge_ko) && (
                  <div className="mb-6 bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                    <h4 className="text-red-500 font-semibold mb-2 flex items-center gap-2"><Code size={18} />{language === 'en' ? 'Technical Challenge' : '기술적 도전'}</h4>
                    <p className="text-gray-400 leading-relaxed">{language === 'en' ? project.challenge_en : project.challenge_ko}</p>
                  </div>
                )}
                {(project.result_en || project.result_ko) && (
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                    <h4 className="text-green-500 font-semibold mb-2 flex items-center gap-2"><CheckCircle size={18} />{language === 'en' ? 'Results' : '결과'}</h4>
                    <p className="text-gray-400 leading-relaxed">{language === 'en' ? project.result_en : project.result_ko}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ────────────────────────────────────────────────
// ProcessPage
// ────────────────────────────────────────────────
const ProcessPage = ({ t, language, process }) => {
  useFadeIn();
  useEffect(() => { injectStyles(); }, []);
  return (
  <section className="mk-page py-32 bg-black min-h-screen">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-16 pt-20 mk-fade">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">{t?.process?.title}</h1>
        <p className="text-xl text-gray-400">{t?.process?.subtitle}</p>
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "linear-gradient(to bottom, #ef4444, transparent)", transform: "translateX(-50%)" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 52 }}>
          {process.map((s, i) => (
            <div key={i} className="mk-fade" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", position: "relative", alignItems: "start" }}>
              {i % 2 === 0 ? (
                <div style={{ textAlign: "right", paddingRight: 50 }}>
                  <span style={{ display: "inline-block", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 99, padding: "2px 12px", fontSize: 12, color: "#ef4444", fontWeight: 600, marginBottom: 8 }}>{s.step}</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#fff" }}>{language === "en" ? s.title_en : s.title_ko}</h3>
                    <span style={{ fontSize: 24 }}>{s.icon || "🚀"}</span>
                  </div>
                  <p style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.7, margin: "0 0 8px" }}>{language === "en" ? s.desc_en : s.desc_ko}</p>
                  {s.duration && <span style={{ color: "#6b7280", fontSize: 12 }}>⏱ {s.duration}</span>}
                </div>
              ) : <div />}
              {i % 2 !== 0 ? (
                <div style={{ paddingLeft: 50 }}>
                  <span style={{ display: "inline-block", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 99, padding: "2px 12px", fontSize: 12, color: "#ef4444", fontWeight: 600, marginBottom: 8 }}>{s.step}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 24 }}>{s.icon || "🚀"}</span>
                    <h3 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#fff" }}>{language === "en" ? s.title_en : s.title_ko}</h3>
                  </div>
                  <p style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.7, margin: "0 0 8px" }}>{language === "en" ? s.desc_en : s.desc_ko}</p>
                  {s.duration && <span style={{ color: "#6b7280", fontSize: 12 }}>⏱ {s.duration}</span>}
                </div>
              ) : <div />}
              <div style={{ position: "absolute", left: "50%", top: 20, transform: "translateX(-50%)", width: 12, height: 12, background: "#ef4444", borderRadius: "50%", border: "3px solid #000" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
  );
};

// ────────────────────────────────────────────────
// 메인 컴포넌트
// ────────────────────────────────────────────────
const MadKoreanWebsite = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [language, setLanguage] = useState('en');
  const [scrollY, setScrollY] = useState(0);
  const [content, setContent] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [process, setProcess] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      window.requestAnimationFrame ? window.requestAnimationFrame(() => setScrollY(window.scrollY)) : setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        const contentUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Content`;
        const contentRes = await fetch(contentUrl);
        if (!contentRes.ok) throw new Error('Failed to load');
        const contentText = await contentRes.text();
        const contentLines = contentText.split('\n');
        const contentData = { en: {}, ko: {} };
        for (let i = 1; i < contentLines.length; i++) {
          const line = contentLines[i].trim();
          if (!line) continue;
          const parts = line.split(',').map(p => p.replace(/^"|"$/g, '').trim());
          const [section, key, enText, koText] = parts;
          if (section && key) {
            if (!contentData.en[section]) contentData.en[section] = {};
            if (!contentData.ko[section]) contentData.ko[section] = {};
            // Sheets에서 빈값이면 fallback 사용
            const fbEn = fallbackContent.en?.[section]?.[key] || '';
            const fbKo = fallbackContent.ko?.[section]?.[key] || '';
            contentData.en[section][key] = enText || fbEn;
            contentData.ko[section][key] = koText || fbKo;
          }
        }
        setContent(contentData);

        // stat1~3은 특수문자 문제로 Sheets 파싱이 불안정 → 항상 fallback으로 고정
        ['en', 'ko'].forEach(lang => {
          if (!contentData[lang].engine) contentData[lang].engine = {};
          const fb = fallbackContent[lang].engine;
          ['stat1', 'stat1Label', 'stat2', 'stat2Label', 'stat3', 'stat3Label'].forEach(k => {
            if (!contentData[lang].engine[k]) contentData[lang].engine[k] = fb[k];
          });
        });

        const fetchSheet = async (sheetName) => {
          const res = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`);
          const text = await res.text();
          // 정식 CSV 파서: 따옴표 안의 콤마/줄바꿈 올바르게 처리
          const parseCSV = (str) => {
            const rows = [];
            let row = [], cur = '', inQ = false;
            for (let i = 0; i < str.length; i++) {
              const ch = str[i], next = str[i + 1];
              if (inQ) {
                if (ch === '"' && next === '"') { cur += '"'; i++; }
                else if (ch === '"') { inQ = false; }
                else { cur += ch; }
              } else {
                if (ch === '"') { inQ = true; }
                else if (ch === ',') { row.push(cur.trim()); cur = ''; }
                else if (ch === '\n' || (ch === '\r' && next === '\n')) {
                  row.push(cur.trim()); rows.push(row); row = []; cur = '';
                  if (ch === '\r') i++;
                } else { cur += ch; }
              }
            }
            if (cur || row.length) { row.push(cur.trim()); rows.push(row); }
            return rows;
          };
          const rows = parseCSV(text);
          return rows.slice(1).filter(r => r.some(c => c));
        };

        const portfolioRows = await fetchSheet('Portfolio');
        setPortfolio(portfolioRows.filter(p => p[0]).map(p => ({ title_en: p[0], title_ko: p[1], desc_en: p[2], desc_ko: p[3], tech: p[4], image: p[5], challenge_en: p[6], challenge_ko: p[7], result_en: p[8], result_ko: p[9] })));

        const processRows = await fetchSheet('Process');
        setProcess(processRows.filter(p => p[0]).map(p => ({ step: p[0], title_en: p[1], title_ko: p[2], desc_en: p[3], desc_ko: p[4], duration: p[5], icon: p[6] })));

        const testimonialsRows = await fetchSheet('Testimonials');
        const testimonialsData = testimonialsRows.filter(p => p[0]).map(p => ({ name_en: p[0], name_ko: p[1], company: p[2], role_en: p[3], role_ko: p[4], text_en: p[5], text_ko: p[6], rating: parseInt(p[7]) || 5 }));
        setTestimonials(testimonialsData.length > 0 ? testimonialsData : fallbackTestimonials);

        const faqRows = await fetchSheet('FAQ');
        const faqData = faqRows.filter(p => p[0]).map(p => ({ q_en: p[0], q_ko: p[1], a_en: p[2], a_ko: p[3] }));
        setFaqs(faqData.length > 0 ? faqData : fallbackFaqs);

        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setContent(fallbackContent);
        setTestimonials(fallbackTestimonials);
        setFaqs(fallbackFaqs);
        setLoading(false);
      }
    };
    fetchSheets();
  }, []);

  useEffect(() => {
    document.title = 'Mad Korean - Elite Korean Development Agency | Web & Mobile Development';
  }, []);

  const handleNavigate = useCallback((page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // GA 페이지뷰 추적
    const pageNames = { home: 'Home', portfolio: 'Portfolio', process: 'Process', contact: 'Contact' };
    gaPageView(pageNames[page] || page);
    gaEvent('navigation_click', { page_name: page });
  }, []);

  const t = useMemo(() => content?.[language] || fallbackContent[language], [content, language]);

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-red-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-white text-xl font-semibold">Loading Mad Korean...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { key: 'home', label: t?.nav?.home || 'Home' },
    { key: 'portfolio', label: t?.nav?.portfolio || 'Portfolio' },
    { key: 'process', label: t?.nav?.process || 'Process' },
    { key: 'contact', label: t?.nav?.contact || 'Contact' },
  ];

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)', zIndex: 9999, borderBottom: '1px solid #1f2937' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* 로고 */}
          <button onClick={() => handleNavigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Mad Korean Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', mixBlendMode: 'screen' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              <span style={{ color: '#fff' }}>MAD</span>
              <span style={{ color: '#ef4444' }}>KOREAN</span>
            </span>
          </button>

          {/* 데스크탑 메뉴 */}
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            {navItems.map(item => (
              <button key={item.key} onClick={() => handleNavigate(item.key)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500, color: currentPage === item.key ? '#ef4444' : '#d1d5db', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = currentPage === item.key ? '#ef4444' : '#d1d5db'}>
                {item.label}
              </button>
            ))}
          </div>

          {/* 우측 버튼 그룹 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Book a Call 버튼 */}
            <a href="https://calendly.com/pender0207/30min" target="_blank" rel="noopener noreferrer"
              onClick={() => gaEvent('book_a_call_click', { location: 'navbar' })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: '#ef4444', border: 'none', borderRadius: '9999px', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
              onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}>
              📅 {language === 'en' ? 'Book a Call' : '미팅 예약'}
            </a>
            {/* 언어 버튼 */}
            <button onClick={() => setLanguage(language === 'en' ? 'ko' : 'en')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #ef4444', borderRadius: '9999px', background: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <Globe size={16} />
              {language === 'en' ? '한국어' : 'English'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── PAGES ── */}
      {currentPage === 'home' && <HomePage t={t} language={language} scrollY={scrollY} testimonials={testimonials} faqs={faqs} onNavigate={handleNavigate} />}
      {currentPage === 'portfolio' && <PortfolioPage t={t} language={language} portfolio={portfolio} />}
      {currentPage === 'process' && <ProcessPage t={t} language={language} process={process} />}
      {currentPage === 'contact' && <ContactPage t={t} language={language} onNavigate={handleNavigate} />}

      {/* ── FOOTER ── */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2024 Mad Korean. All rights reserved.</p>
          <p className="mt-2">Madly fast. Madly precise. Madly Korean.</p>
        </div>
      </footer>
    </div>
  );
};

export default MadKoreanWebsite;
