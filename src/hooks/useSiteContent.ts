'use client'

import { useState, useEffect } from 'react'

// Default content - matches the API defaults
const defaultContent: Record<string, string> = {
  hero_since_label: '২০২৫ থেকে',
  hero_subtitle: 'নতুন রূপে ফ্যাশন',
  hero_description: 'ঐতিহ্যবাহী কারুশিল্পের সাথে আধুনিক ফ্যাশনের মেলবন্ধন। আপনার জন্য সেরা সালোয়ার কামিজ, শাড়ি ও লেহেঙ্গা — সরাসরি আপনার ঘরে পৌঁছে যাবে।',
  hero_image: '/images/hero.png',
  about_label: 'আমাদের গল্প',
  about_title_line1: 'ঐতিহ্য',
  about_title_line2: 'আর ফ্যাশনের মেলবন্ধন',
  about_paragraph1: 'স্বপ্ন পূরণ জন্মেছিল এক স্বপ্ন থেকে — নারীদের ফ্যাশনকে নতুন রূপে উপস্থাপন করার স্বপ্ন। আমাদের প্রতিটি পোশাক শিল্পীদের হাতের কারুকাজ, যেখানে প্রতিটি সেলাইয়ে মিশে আছে ভালোবাসা আর যত্ন।',
  about_paragraph2: 'আমরা বিশ্বাস করি, সত্যিকারের বিলাসিতা লুকিয়ে আছে প্রতিটি ছোট বিস্তারিতে — সেরা ফ্যাব্রিক, নিখুঁত এমব্রয়ডারি, আর এমন পোশাক যা আপনাকে স্বতন্ত্র করে তোলে।',
  about_experience_years: '১৫+',
  about_experience_label: 'বছরের অভিজ্ঞতা',
  about_stat1_number: '৫০০+',
  about_stat1_label: 'ডিজাইন',
  about_stat2_number: '৩০+',
  about_stat2_label: 'জেলা',
  about_stat3_number: '৫০ হা+',
  about_stat3_label: 'খুশি গ্রাহক',
  about_image: '/images/about.png',
  showcase_label: 'কেন আমরা',
  showcase_title: 'প্রিমিয়াম মান',
  showcase_feature1_title: 'অরিজিনাল ক্রাফট',
  showcase_feature1_desc: 'প্রতিটি পোশাক দক্ষ কারিগরদের হাতে তৈরি',
  showcase_feature2_title: 'প্রিমিয়াম মান',
  showcase_feature2_desc: 'বিশ্বস্ত সরবরাহকারী থেকে সেরা ফ্যাব্রিক',
  showcase_feature3_title: 'ভালোবাসায় তৈরি',
  showcase_feature3_desc: 'প্রজন্ম থেকে প্রজন্মে চলে আসা ঐতিহ্যবাহী কৌশল',
  showcase_image1: '/images/showcase/showcase1.png',
  showcase_image2: '/images/showcase/showcase2.png',
  showcase_image3: '/images/showcase/showcase3.png',
  showcase_image4: '/images/showcase/showcase4.png',
  featured_label: 'বিশেষ সংগ্রহ',
  featured_title: 'ফিচার্ড',
  footer_brand_description: 'ঐতিহ্যবাহী কারুশিল্পের সাথে আধুনিক ফ্যাশনের মেলবন্ধন। আপনার জন্য সেরা পোশাক।',
  footer_phone: '+880 1913551490',
  footer_whatsapp: '8801913551490',
  footer_email: 'dolamaanha@gmail.com',
  footer_facebook: 'https://www.facebook.com/profile.php?id=100095208882295',
  footer_facebook_name: 'রাজশ্রী ফ্যাশন',
  footer_instagram: '',
  footer_address: 'ঢাকা, বাংলাদেশ',

  // Order/Checkout Page
  order_title: 'অর্ডার করুন',
  order_subtitle: 'অর্ডার করলে স্বয়ংক্রিয়ভাবে আমাদের Gmail (dolamaanha@gmail.com) এ নোটিফিকেশন যাবে',
  order_info_title: 'আপনার তথ্য',
  order_name_placeholder: 'আপনার নাম',
  order_phone_placeholder: 'ফোন নম্বর',
  order_address_placeholder: 'সম্পূর্ণ ঠিকানা',
  order_notes_placeholder: 'বিশেষ নোট (ঐচ্ছিক)',
  order_payment_title: 'পেমেন্ট পদ্ধতি',
  order_summary_title: 'অর্ডার সারাংশ',
  order_payment_instruction: 'পেমেন্ট করার পর অর্ডার কনফার্ম করতে নিচের যোগাযোগে আপনার পেমেন্টের স্ক্রিনশট পাঠান।',
  order_notification_text: 'অর্ডার কনফার্ম হলে dolamaanha@gmail.com এ স্বয়ংক্রিয় নোটিফিকেশন যাবে',
  order_button_text: 'অর্ডার নিশ্চিত করুন',
  order_success_title: 'অর্ডার সফল হয়েছে!',
  order_success_message: 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
  order_confirm_title: 'পেমেন্ট নিশ্চিত করুন',
  order_contact_title: 'যোগাযোগ করুন',
  order_notification_email: 'dolamaanha@gmail.com',
  order_total_label: 'মোট',
  order_empty_cart_text: 'তালিকায় কোনো পোশাক নেই',
  order_payment_instruction_before: 'পেমেন্ট পদ্ধতি নির্বাচন করুন',
  order_payment_instruction_after: 'নিচের নম্বরে পেমেন্ট করুন এবং পেমেন্টের স্ক্রিনশট নিচের যোগাযোগে পাঠান:',
  order_contact_instruction: 'পেমেন্ট করার পর অর্ডার কনফার্ম করতে নিচের যোগাযোগে আপনার পেমেন্টের স্ক্রিনশট পাঠান।',
  order_no_payment_text: 'কোনো পেমেন্ট পদ্ধতি যোগ করা হয়নি। অ্যাডমিন প্যানেল থেকে পেমেন্ট পদ্ধতি যোগ করুন।',
  order_back_button: 'ফিরে যান',
  order_home_button: 'হোমে ফিরে যান',
  order_processing_text: 'প্রসেসিং...',
  order_copy_tooltip: 'কপি করুন',
}

// Cache for site content
let contentCache: Record<string, string> | null = null
let contentPromise: Promise<Record<string, string>> | null = null

async function fetchSiteContent(): Promise<Record<string, string>> {
  if (contentCache) return contentCache
  if (contentPromise) return contentPromise

  contentPromise = fetch('/api/site-content')
    .then((res) => res.json())
    .then((data) => {
      contentCache = data
      contentPromise = null
      return data
    })
    .catch(() => {
      contentPromise = null
      return defaultContent
    })

  return contentPromise
}

// Invalidate cache (called after admin saves content)
export function invalidateSiteContentCache() {
  contentCache = null
}

export function useSiteContent() {
  const [content, setContent] = useState<Record<string, string>>(defaultContent)

  useEffect(() => {
    fetchSiteContent().then((data) => {
      setContent(data)
    })
  }, [])

  const get = (key: string, fallback?: string): string => {
    return content[key] ?? fallback ?? defaultContent[key] ?? ''
  }

  return { content, get }
}
