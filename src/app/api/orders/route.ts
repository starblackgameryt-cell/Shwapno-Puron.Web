import { db } from '@/lib/db'

const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'dolamaanha@gmail.com'

async function sendOrderNotificationEmail(orderDetails: {
  customerName: string
  phone: string
  address: string
  products: { name: string; price: number; quantity: number; size?: string; color?: string }[]
  totalAmount: number
  paymentMethod: string
  notes: string
  orderId: string
}) {
  const { customerName, phone, address, products, totalAmount, paymentMethod, notes, orderId } = orderDetails

  const emailSubject = `🛍️ নতুন অর্ডার - ${customerName} (৳${totalAmount.toLocaleString()})`
  const emailBody = `স্বপ্ন পূরণ - নতুন অর্ডার নোটিফিকেশন
━━━━━━━━━━━━━━━━━━━━━━━

👤 গ্রাহকের নাম: ${customerName}
📞 ফোন নম্বর: ${phone}
📍 ডেলিভারি ঠিকানা: ${address}

👗 অর্ডারকৃত পণ্য:
${products.map((p) => `  • ${p.name} - ৳${p.price.toLocaleString()} x${p.quantity}${p.size ? ` (সাইজ: ${p.size})` : ''}${p.color ? ` (রং: ${p.color})` : ''}`).join('\n')}

💰 মোট মূল্য: ৳${totalAmount.toLocaleString()}
💳 পেমেন্ট পদ্ধতি: ${paymentMethod}
${notes ? `📝 বিশেষ নোট: ${notes}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━
অর্ডার আইডি: ${orderId}
তারিখ: ${new Date().toLocaleString('bn-BD')}
━━━━━━━━━━━━━━━━━━━━━━━

এই অর্ডারটি স্বপ্ন পূরণ ওয়েবসাইট থেকে এসেছে।`

  // Try to send actual email via SMTP if configured
  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: 587,
        secure: false,
        auth: { user: smtpUser, pass: smtpPass },
      })
      await transporter.sendMail({
        from: `"স্বপ্ন পূরণ" <${smtpUser}>`,
        to: BUSINESS_EMAIL,
        subject: emailSubject,
        text: emailBody,
      })
      console.log('Order notification email sent to', BUSINESS_EMAIL)
      return true
    } catch (error) {
      console.error('Failed to send order email via SMTP:', error)
    }
  }

  // Fallback: Create admin notification in DB
  try {
    await db.adminNotification.create({
      data: {
        type: 'new_order',
        message: `নতুন অর্ডার - ${customerName} (৳${totalAmount.toLocaleString()})`,
        details: `পেমেন্ট: ${paymentMethod} | ফোন: ${phone} | পণ্য: ${products.length}টি`,
        isRead: false,
      },
    })
  } catch (e) {
    console.error('Failed to create admin notification:', e)
  }

  return false
}

export async function POST(request: Request) {
  try {
    const { customerName, phone, address, products, totalAmount, paymentMethod, notes, paymentMethodId } = await request.json()

    if (!customerName || !phone || !address || !products) {
      return Response.json({ error: 'সকল তথ্য পূরণ করুন' }, { status: 400 })
    }

    const order = await db.order.create({
      data: {
        customerName,
        phone,
        address,
        products: JSON.stringify(products),
        totalAmount: totalAmount || 0,
        paymentMethod: paymentMethod || 'cod',
        notes: notes || '',
      },
    })

    // Send email notification to admin (dolamaanha@gmail.com)
    await sendOrderNotificationEmail({
      customerName,
      phone,
      address,
      products,
      totalAmount: totalAmount || 0,
      paymentMethod: paymentMethod || 'cod',
      notes: notes || '',
      orderId: order.id,
    })

    // Build Gmail compose URL as backup
    const emailSubject = `🛍️ নতুন অর্ডার - ${customerName} (৳${totalAmount?.toLocaleString()})`
    const emailBody = `স্বপ্ন পূরণ - নতুন অর্ডার নোটিফিকেশন\n\n👤 নাম: ${customerName}\n📞 ফোন: ${phone}\n📍 ঠিকানা: ${address}\n👗 পণ্য: ${products.map((p: { name: string; quantity: number }) => `${p.name} x${p.quantity}`).join(', ')}\n💰 মোট: ৳${totalAmount?.toLocaleString()}\n💳 পেমেন্ট: ${paymentMethod}\nঅর্ডার আইডি: ${order.id}`
    const gmailUrl = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

    // Build WhatsApp URL
    const whatsappNumber = process.env.BUSINESS_PHONE || '8801913551490'
    const whatsappMsg = `🛍️ নতুন অর্ডার!\n\n👤 নাম: ${customerName}\n📞 ফোন: ${phone}\n📍 ঠিকানা: ${address}\n👗 পণ্য: ${products.map((p: { name: string; quantity: number }) => `${p.name} x${p.quantity}`).join(', ')}\n💰 মোট: ৳${totalAmount?.toLocaleString()}\n💳 পেমেন্ট: ${paymentMethod}`
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`

    return Response.json({
      success: true,
      order,
      whatsappUrl,
      gmailUrl,
      message: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!',
    })
  } catch (error) {
    console.error('Order error:', error)
    return Response.json({ error: 'অর্ডার করতে সমস্যা হয়েছে' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Only admin can access all orders
    const { verifyAdminSession } = await import('@/lib/auth')
    const adminToken = request.headers.get('cookie')?.match(/admin_token=([^;]+)/)?.[1]
    if (!adminToken) {
      return Response.json({ error: 'অনুমোদন প্রয়োজন' }, { status: 401 })
    }
    const adminSession = await verifyAdminSession(adminToken)
    if (!adminSession) {
      return Response.json({ error: 'অনুমোদন প্রয়োজন' }, { status: 401 })
    }

    const orders = await db.order.findMany({ orderBy: { createdAt: 'desc' } })
    return Response.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
