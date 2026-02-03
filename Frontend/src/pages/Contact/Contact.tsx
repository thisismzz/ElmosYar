import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, Instagram, Twitter, Clock, Users, MessageCircle } from 'lucide-react';
import './Contact.css';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  const handleFaqClick = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const contactInfo = [
    {
      icon: <Mail size={24} />,
      title: 'ایمیل',
      value: 'support@elmosyar.com',
      description: 'برای پشتیبانی فنی و گزارش مشکلات'
    },
    {
      icon: <Phone size={24} />,
      title: 'تلفن',
      value: '۰۲۱-۸۸۷۷۶۶۵۵',
      description: 'شنبه تا چهارشنبه ۹:۰۰ تا ۱۷:۰۰'
    },
    {
      icon: <MessageSquare size={24} />,
      title: 'پشتیبانی آنلاین',
      value: 'elmosyar_support@',
      description: 'کانال پشتیبانی'
    },
    {
      icon: <MessageCircle size={24} />,
      title: 'آدرس',
      value: 'تهران، دانشگاه علم و صنعت',
      description: 'دفتر مرکزی'
    }
  ];

  const socialLinks = [
    {
      icon: <Instagram size={20} />,
      name: 'اینستاگرام',
      link: 'https://instagram.com/elmosyar',
      color: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)'
    },
    {
      icon: <MessageCircle size={20} />,
      name: 'تلگرام',
      link: 'https://t.me/elmosyar',
      color: '#0088cc'
    },
    {
      icon: <Twitter size={20} />,
      name: 'توییتر',
      link: 'https://twitter.com/elmosyar',
      color: '#101010ff'
    }
  ];

  const faqItems = [
    {
      question: 'چگونه می‌توانم کیف پول خود را شارژ کنم؟',
      answer: 'از طریق بخش کیف پول در پروفایل کاربری می‌توانید با درگاه بانکی اقدام به شارژ کیف پول نمایید.'
    },
	{
      question: 'چگونه می‌توانم نظرات خود را درباره اساتید ثبت کنم؟',
      answer: 'از طریق بخش "نظرسنجی اساتید" در منو اصلی می‌توانید به اساتید به صورت ناشناس نمره دهید و کامنت اضافه کنید.'
    },
    {
      question: 'چگونه غذای خود را برای فروش قرار دهم؟',
      answer: 'در صفحه اصلی روی دکمه "اضافه کردن پست جدید" کلیک کنید و اطلاعات غذا را وارد نمایید.'
    },
    {
      question: 'چگونه می‌توانم غدا را خریداری کنم؟',
      answer: 'از طریق بخش "تبادل غذا" در منوی اصلی می‌توانید غذا مورد نظر را خریداری نمایید.'
    }
  ];

  return (
    <div className="contact-us-container">
      <div className="contactus-header">
        <div className="header-content">
          <h1 className="contact-page-title">گزارش مشکل</h1>
          <p className="contact-page-subtitle">ما اینجا هستیم تا به شما کمک کنیم</p>
          <div className="contact-header-description">
            <p>
              هر سوال، پیشنهاد یا مشکلی دارید، تیم پشتیبانی ما آماده کمک به شماست.
              <br />
              از طریق راه‌های ارتباطی زیر با ما در تماس باشید.
            </p>
          </div>
        </div>
        <div className="header-illustration">
          <Users size={120} className="illustration-icon" />
        </div>
      </div>

      <div className="contact-content">
        {/* بخش اطلاعات تماس */}
        <div className="contact-info-section">
          <h2 className="section-title">
            <Phone size={20} />
            <span>راه‌های ارتباطی</span>
          </h2>
          <div className="contact-info-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className="info-card">
                <div className="info-icon" style={{ background: 'var(--primary-light)' }}>
                  {info.icon}
                </div>
                <h3 className="info-title">{info.title}</h3>
                <p className="info-value">{info.value}</p>
                <p className="info-description">{info.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="contact-layout">
          {/* سمت چپ: فرم تماس + سوالات متداول */}
          <div className="left-column">

            {/* سوالات متداول زیر فرم */}
            <div className="faq-section">
              <h2 className="section-title">
                <MessageCircle size={20} />
                <span>سوالات متداول</span>
              </h2>
              <div className="faq-accordion">
                {faqItems.map((item, index) => (
                  <div key={index} className="faq-item">
                    <div 
                      className="faq-question-header"
                      onClick={() => handleFaqClick(index)}
                    >
                      <span className="faq-question">{item.question}</span>
                      <span className="faq-icon">
                        {openFaqIndex === index ? '−' : '+'}
                      </span>
                    </div>
                    <div 
                      className={`faq-answer-content ${openFaqIndex === index ? 'active' : ''}`}
                    >
                      <p className="faq-answer">{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* سمت راست: شبکه‌های اجتماعی و ساعات کاری */}
          <div className="right-sidebar">
            {/* شبکه‌های اجتماعی */}
            <div className="social-section">
              <h2 className="section-title">
                <MessageSquare size={20} />
                <span>شبکه‌های اجتماعی</span>
              </h2>
              <div className="social-cards">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-card"
                    style={{ background: social.color }}
                  >
                    <div className="social-icon">
                      {social.icon}
                    </div>
                    <span className="social-name">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* ساعات کاری */}
            <div className="hours-section">
              <h2 className="section-title">
                <Clock size={20} />
                <span>ساعات کاری</span>
              </h2>
              <div className="hours-card">
                <div className="hours-item">
                  <span className="day">شنبه تا چهارشنبه</span>
                  <span className="time">۹:۰۰ - ۱۷:۰۰</span>
                </div>
                <div className="hours-item">
                  <span className="day">پنجشنبه و جمعه</span>
                  <span className="time closed">تعطیل</span>
                </div>
                <div className="hours-note">
                  پشتیبانی آنلاین ۲۴ ساعته از طریق پیام‌رسان‌ها فعال است.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;