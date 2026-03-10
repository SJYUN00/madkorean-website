import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Globe, Clock, Zap, Code, ChevronDown, CheckCircle, DollarSign, Smartphone, Monitor, Database, Package, Star, Send } from 'lucide-react';

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
  const [visibleSections, setVisibleSections] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    budget: '',
    devType: [],
    message: ''
  });

  const SHEET_ID = '1xC8EEsa4ec_H3ma1JdvMxMeO41CvCkOMpO0iJks-fek';

  const fallbackContent = {
    en: {
      nav: { home: 'Home', obsession: 'Our Obsession', portfolio: 'Portfolio', process: 'Process', contact: 'Contact' },
      hero: { title1: 'Madly Fast.', title2: 'Madly Precise.', title3: 'Madly Korean.', subtitle: "We don't just code. We are obsessed with perfection.", cta: 'Start Your Project' },
      engine: { title: 'The 24/7 Engine', subtitle: 'We Build While You Sleep', description: "When it's evening in the US, it's morning in Korea. The feedback you submit before leaving work is already implemented before you arrive the next day.", stat1: '< 12hr', stat1Label: 'Turnaround Time', stat2: '100%', stat2Label: 'Real-time Updates', stat3: '24/7', stat3Label: 'Development Cycle' },
      obsession: { title: 'Our Obsession', subtitle: "Why We're Different", point1Title: 'Elite Engineering', point1Desc: 'Korean developers are among the most rigorously educated in the world.', point2Title: 'Clean Code Standard', point2Desc: 'Every line is documented, tested, and built to scale.', point3Title: 'Obsessive Detail', point3Desc: "We treat your project like it's ours." },
      portfolio: { title: 'Our Work', subtitle: 'Real Problems. Real Solutions.' },
      process: { title: 'Development Process', subtitle: 'How We Turn Ideas Into Reality' },
      testimonials: { title: 'Client Success Stories', subtitle: 'What Our Clients Say' },
      faq: { title: 'Frequently Asked Questions', subtitle: 'Everything you need to know' },
      contact: { title: 'Start Your Project', subtitle: "Let's build something extraordinary together", namePlaceholder: 'Your Name', emailPlaceholder: 'Email Address', companyPlaceholder: 'Company Name (Optional)', budgetLabel: 'Budget Range', devTypeLabel: 'Development Type', messagePlaceholder: 'Tell us about your project...', submitButton: 'Send Message' },
      cta: { title: 'Ready to Experience Mad Korean Quality?', subtitle: "Let's build something extraordinary together.", button: 'Get Started', email: 'hello@madkorean.com' }
    },
    ko: {
      nav: { home: '홈', obsession: '우리의 집착', portfolio: '포트폴리오', process: '프로세스', contact: '연락하기' },
      hero: { title1: '미친듯이 빠르게.', title2: '미친듯이 정확하게.', title3: '미친듯이 한국적으로.', subtitle: '우리는 단순히 코딩하지 않습니다. 완벽함에 집착합니다.', cta: '프로젝트 시작하기' },
      engine: { title: '24/7 엔진', subtitle: '당신이 자는 동안 우리는 만듭니다', description: '미국이 저녁일 때 한국은 아침입니다. 퇴근 전 남긴 피드백은 다음날 출근 전 이미 구현되어 있습니다.', stat1: '< 12시간', stat1Label: '피드백 반영', stat2: '100%', stat2Label: '실시간 업데이트', stat3: '24/7', stat3Label: '개발 사이클' },
      obsession: { title: '우리의 집착', subtitle: '왜 우리가 다른가', point1Title: '엘리트 엔지니어링', point1Desc: '한국 개발자들은 세계에서 가장 엄격한 교육을 받습니다.', point2Title: '클린 코드 기준', point2Desc: '모든 라인은 문서화되고, 테스트되며, 확장 가능하게 작성됩니다.', point3Title: '집요한 디테일', point3Desc: '당신의 프로젝트를 우리 것처럼 다룹니다.' },
      portfolio: { title: '우리의 작업물', subtitle: '실제 문제. 실제 솔루션.' },
      process: { title: '개발 프로세스', subtitle: '아이디어를 현실로 만드는 방법' },
      testimonials: { title: '고객 성공 사례', subtitle: '고객들의 이야기' },
      faq: { title: '자주 묻는 질문', subtitle: '알아야 할 모든 것' },
      contact: { title: '프로젝트 시작하기', subtitle: '함께 특별한 것을 만들어봅시다', namePlaceholder: '이름', emailPlaceholder: '이메일 주소', companyPlaceholder: '회사명 (선택)', budgetLabel: '예산 범위', devTypeLabel: '개발 유형', messagePlaceholder: '프로젝트에 대해 알려주세요...', submitButton: '메시지 보내기' },
      cta: { title: 'Mad Korean의 품질을 경험할 준비가 되셨나요?', subtitle: '함께 특별한 것을 만들어봅시다.', button: '시작하기', email: 'hello@madkorean.com' }
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

  useEffect(() => {
    const handleScroll = () => {
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(() => setScrollY(window.scrollY));
      } else {
        setScrollY(window.scrollY);
      }
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
          
          const parts = line.split(',').map(part => part.replace(/^"|"$/g, '').trim());
          const [section, key, enText, koText] = parts;
          
          if (section && key) {
            if (!contentData.en[section]) contentData.en[section] = {};
            if (!contentData.ko[section]) contentData.ko[section] = {};
            contentData.en[section][key] = enText || '';
            contentData.ko[section][key] = koText || '';
          }
        }
        
        setContent(contentData);

        const portfolioUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Portfolio`;
        const portfolioRes = await fetch(portfolioUrl);
        const portfolioText = await portfolioRes.text();
        const portfolioLines = portfolioText.split('\n');
        
        const portfolioData = [];
        for (let i = 1; i < portfolioLines.length; i++) {
          const line = portfolioLines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',').map(part => part.replace(/^"|"$/g, '').trim());
          if (parts[0]) {
            portfolioData.push({
              title_en: parts[0] || '', title_ko: parts[1] || '', desc_en: parts[2] || '', desc_ko: parts[3] || '',
              tech: parts[4] || '', image: parts[5] || '', challenge_en: parts[6] || '', challenge_ko: parts[7] || '',
              result_en: parts[8] || '', result_ko: parts[9] || ''
            });
          }
        }
        
        setPortfolio(portfolioData);

        const processUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Process`;
        const processRes = await fetch(processUrl);
        const processText = await processRes.text();
        const processLines = processText.split('\n');
        
        const processData = [];
        for (let i = 1; i < processLines.length; i++) {
          const line = processLines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',').map(part => part.replace(/^"|"$/g, '').trim());
          if (parts[0]) {
            processData.push({
              step: parts[0] || '', title_en: parts[1] || '', title_ko: parts[2] || '',
              desc_en: parts[3] || '', desc_ko: parts[4] || '', duration: parts[5] || '', icon: parts[6] || ''
            });
          }
        }
        
        setProcess(processData);
        
        const testimonialsUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Testimonials`;
        const testimonialsRes = await fetch(testimonialsUrl);
        const testimonialsText = await testimonialsRes.text();
        const testimonialsLines = testimonialsText.split('\n');
        
        const testimonialsData = [];
        for (let i = 1; i < testimonialsLines.length; i++) {
          const line = testimonialsLines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',').map(part => part.replace(/^"|"$/g, '').trim());
          if (parts[0]) {
            testimonialsData.push({
              name_en: parts[0] || '', name_ko: parts[1] || '', company: parts[2] || '',
              role_en: parts[3] || '', role_ko: parts[4] || '', text_en: parts[5] || '',
              text_ko: parts[6] || '', rating: parseInt(parts[7]) || 5
            });
          }
        }
        
        setTestimonials(testimonialsData.length > 0 ? testimonialsData : fallbackTestimonials);

        const faqUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=FAQ`;
        const faqRes = await fetch(faqUrl);
        const faqText = await faqRes.text();
        const faqLines = faqText.split('\n');
        
        const faqData = [];
        for (let i = 1; i < faqLines.length; i++) {
          const line = faqLines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',').map(part => part.replace(/^"|"$/g, '').trim());
          if (parts[0]) {
            faqData.push({
              q_en: parts[0] || '', q_ko: parts[1] || '',
              a_en: parts[2] || '', a_ko: parts[3] || ''
            });
          }
        }
        
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, [currentPage]);

  useEffect(() => {
    document.title = 'Mad Korean - Elite Korean Development Agency | Web & Mobile Development';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Mad Korean: Elite Korean software development agency. We build world-class web apps, mobile apps, and enterprise solutions. 24/7 development cycle, premium engineering, madly fast delivery.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Mad Korean: Elite Korean software development agency. We build world-class web apps, mobile apps, and enterprise solutions. 24/7 development cycle, premium engineering, madly fast delivery.';
      document.head.appendChild(meta);
    }
  }, []);

  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        devType: checked ? [...prev.devType, value] : prev.devType.filter(t => t !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const mailto = `mailto:hello@madkorean.com?subject=New Project Inquiry from ${formData.name}&body=Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0ACompany: ${formData.company}%0D%0ABudget: ${formData.budget}%0D%0ADevelopment Type: ${formData.devType.join(', ')}%0D%0A%0D%0AMessage:%0D%0A${formData.message}`;
    window.location.href = mailto;
  }, [formData]);

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

  const HomePage = () => (
    <>
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, #dc2626 0%, transparent 50%)',
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        />
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            <div className="text-white mb-2">{t?.hero?.title1 || 'Madly Fast.'}</div>
            <div className="text-white mb-2">{t?.hero?.title2 || 'Madly Precise.'}</div>
            <div className="text-red-500">{t?.hero?.title3 || 'Madly Korean.'}</div>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            {t?.hero?.subtitle || "We don't just code. We are obsessed with perfection."}
          </p>
          <button 
            onClick={() => setCurrentPage('contact')}
            className="inline-block px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-full transition transform hover:scale-105"
          >
            {t?.hero?.cta || 'Start Your Project'}
          </button>
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown size={32} className="text-red-500" />
          </div>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">{t?.engine?.title || 'The 24/7 Engine'}</h2>
            <p className="text-2xl text-red-500 font-semibold">{t?.engine?.subtitle || 'We Build While You Sleep'}</p>
          </div>
          <p className="text-xl text-gray-300 text-center max-w-4xl mx-auto mb-16 leading-relaxed">{t?.engine?.description || "When it's evening in the US, it's morning in Korea."}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {['stat1', 'stat2', 'stat3'].map((stat, i) => (
              <div key={i} className="bg-black/50 border border-red-500/30 rounded-lg p-8 text-center hover:border-red-500 transition-all duration-300 transform hover:scale-105">
                <div className="text-5xl font-bold text-red-500 mb-2">{t?.engine?.[stat] || '24/7'}</div>
                <div className="text-gray-400">{t?.engine?.[`${stat}Label`] || 'Label'}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="obsession" className="py-32 bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">{t?.obsession?.title || 'Our Obsession'}</h2>
            <p className="text-xl text-gray-400">{t?.obsession?.subtitle || "Why We're Different"}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Code, key: 'point1' },
              { icon: Zap, key: 'point2' },
              { icon: Clock, key: 'point3' }
            ].map(({ icon: Icon, key }, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-500/20 transition">
                  <Icon size={40} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t?.obsession?.[`${key}Title`] || 'Title'}</h3>
                <p className="text-gray-400 leading-relaxed">{t?.obsession?.[`${key}Desc`] || 'Description'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">{t?.testimonials?.title || 'Client Success Stories'}</h2>
            <p className="text-xl text-gray-400">{t?.testimonials?.subtitle || 'What Our Clients Say'}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {(testimonials.length > 0 ? testimonials : fallbackTestimonials).map((item, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105">
                <div className="flex gap-1 mb-4">
                  {[...Array(item.rating)].map((_, j) => (
                    <Star key={j} size={20} className="fill-red-500 text-red-500" />
                  ))}
                </div>
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

      <section className="py-32 bg-black">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">{t?.faq?.title || 'Frequently Asked Questions'}</h2>
            <p className="text-xl text-gray-400">{t?.faq?.subtitle || 'Everything you need to know'}</p>
          </div>
          <div className="space-y-6">
            {(faqs.length > 0 ? faqs : fallbackFaqs).map((faq, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-red-500/50 transition-all duration-300">
                <h3 className="text-xl font-bold mb-3 text-red-500">{language === 'en' ? faq.q_en : faq.q_ko}</h3>
                <p className="text-gray-400 leading-relaxed">{language === 'en' ? faq.a_en : faq.a_ko}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-t from-red-950/20 to-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">{t?.cta?.title}</h2>
          <p className="text-2xl text-gray-400 mb-12">{t?.cta?.subtitle}</p>
          <button 
            onClick={() => setCurrentPage('contact')}
            className="inline-block px-12 py-5 bg-red-500 hover:bg-red-600 text-white font-bold text-xl rounded-full transition transform hover:scale-105 mb-6"
          >
            {t?.cta?.button}
          </button>
          <p className="text-gray-500">{t?.cta?.email}</p>
        </div>
      </section>
    </>
  );

  const PortfolioPage = () => (
    <section className="py-32 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 pt-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t?.portfolio?.title}</h1>
          <p className="text-xl text-gray-400">{t?.portfolio?.subtitle}</p>
        </div>
        <div className="space-y-24">
          {portfolio.map((project, i) => (
            <div key={i} className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
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
                      {project.tech.split(',').map((tech, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-sm text-red-400">{tech.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(project.challenge_en || project.challenge_ko) && (
                  <div className="mb-6 bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                    <h4 className="text-red-500 font-semibold mb-2 flex items-center gap-2">
                      <Code size={18} />
                      {language === 'en' ? 'Technical Challenge' : '기술적 도전'}
                    </h4>
                    <p className="text-gray-400 leading-relaxed">{language === 'en' ? project.challenge_en : project.challenge_ko}</p>
                  </div>
                )}
                {(project.result_en || project.result_ko) && (
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                    <h4 className="text-green-500 font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle size={18} />
                      {language === 'en' ? 'Results' : '결과'}
                    </h4>
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

  const ProcessPage = () => (
    <section className="py-32 bg-black min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 pt-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t?.process?.title}</h1>
          <p className="text-xl text-gray-400">{t?.process?.subtitle}</p>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 via-red-500/50 to-transparent"></div>
          <div className="space-y-16">
            {process.map((step, i) => (
              <div key={i} className={`relative grid md:grid-cols-2 gap-8 items-center ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                <div className={`${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12 md:col-start-2'}`}>
                  <div className="inline-block bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1 mb-4">
                    <span className="text-red-500 font-semibold">{step.step}</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-3">{language === 'en' ? step.title_en : step.title_ko}</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">{language === 'en' ? step.desc_en : step.desc_ko}</p>
                  {step.duration && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={16} />
                      <span>{step.duration}</span>
                    </div>
                  )}
                </div>
                <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-black"></div>
                </div>
                <div className={`${i % 2 === 0 ? 'md:col-start-2 md:pl-12' : 'md:pr-12'}`}>
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-8 hover:border-red-500/50 transition">
                    <div className="text-6xl mb-4">{step.icon || '🚀'}</div>
                    <div className="text-red-500 text-sm font-semibold">{language === 'en' ? `Step ${i + 1}` : `단계 ${i + 1}`}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const ContactPage = () => (
    <section className="py-32 bg-black min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16 pt-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t?.contact?.title}</h1>
          <p className="text-xl text-gray-400">{t?.contact?.subtitle}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder={t?.contact?.namePlaceholder} required className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition" />
          <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder={t?.contact?.emailPlaceholder} required className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition" />
          <input type="text" name="company" value={formData.company} onChange={handleFormChange} placeholder={t?.contact?.companyPlaceholder} className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition" />
          <div>
            <label className="block text-gray-400 mb-3">{t?.contact?.budgetLabel}</label>
            <select name="budget" value={formData.budget} onChange={handleFormChange} required className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-lg text-white focus:border-red-500 focus:outline-none transition">
              <option value="">Select budget range</option>
              <option value="< $20K">&lt; $20K</option>
              <option value="$20K - $50K">$20K - $50K</option>
              <option value="$50K - $100K">$50K - $100K</option>
              <option value="$100K - $200K">$100K - $200K</option>
              <option value="$200K+">$200K+</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 mb-3">{t?.contact?.devTypeLabel}</label>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { value: 'mobile', label: 'Mobile App', icon: Smartphone },
                { value: 'web', label: 'Web Application', icon: Monitor },
                { value: 'erp', label: 'ERP System', icon: Database },
                { value: 'crm', label: 'CRM System', icon: Package },
                { value: 'ecommerce', label: 'E-commerce', icon: DollarSign },
                { value: 'other', label: 'Other', icon: Code }
              ].map(({ value, label, icon: Icon }) => (
                <label key={value} className="flex items-center gap-3 px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg cursor-pointer hover:border-red-500/50 transition">
                  <input type="checkbox" name="devType" value={value} checked={formData.devType.includes(value)} onChange={handleFormChange} className="w-5 h-5 text-red-500 bg-gray-900 border-gray-700 rounded focus:ring-red-500" />
                  <Icon size={20} className="text-red-500" />
                  <span className="text-white">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <textarea name="message" value={formData.message} onChange={handleFormChange} placeholder={t?.contact?.messagePlaceholder} required rows={6} className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition resize-none" />
          <button type="submit" className="w-full px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2">
            <Send size={20} />
            {t?.contact?.submitButton}
          </button>
        </form>
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-2">or email us directly at</p>
          <a href="mailto:hello@madkorean.com" className="text-red-500 hover:text-red-400 font-semibold text-lg">hello@madkorean.com</a>
        </div>
      </div>
    </section>
  );

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={() => setCurrentPage('home')} className="text-2xl font-bold">
            <span className="text-white">MAD</span>
            <span className="text-red-500">KOREAN</span>
          </button>
          <div className="hidden md:flex gap-8 items-center">
            <button onClick={() => setCurrentPage('home')} className="hover:text-red-500 transition">{t?.nav?.home}</button>
            <button onClick={() => setCurrentPage('portfolio')} className="hover:text-red-500 transition">{t?.nav?.portfolio}</button>
            <button onClick={() => setCurrentPage('process')} className="hover:text-red-500 transition">{t?.nav?.process}</button>
            <button onClick={() => setCurrentPage('contact')} className="hover:text-red-500 transition">{t?.nav?.contact}</button>
          </div>
          <button onClick={() => setLanguage(language === 'en' ? 'ko' : 'en')} className="flex items-center gap-2 px-4 py-2 border border-red-500 rounded-full hover:bg-red-500 transition">
            <Globe size={18} />
            {language === 'en' ? '한국어' : 'English'}
          </button>
        </div>
      </nav>

      {currentPage === 'home' && <HomePage />}
      {currentPage === 'portfolio' && <PortfolioPage />}
      {currentPage === 'process' && <ProcessPage />}
      {currentPage === 'contact' && <ContactPage />}

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