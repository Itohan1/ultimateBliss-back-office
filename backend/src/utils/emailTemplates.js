export function notificationEmailTemplate({ title, message }) {
  return `
  <div style="
    background-color:#f6f4fb;
    padding:40px 20px;
    font-family:Arial, Helvetica, sans-serif;
  ">
    <div style="
      max-width:600px;
      margin:0 auto;
      background:#ffffff;
      border-radius:12px;
      overflow:hidden;
      box-shadow:0 8px 24px rgba(0,0,0,0.08);
    ">
      
      <!-- Header -->
      <div style="
        background:#FE408E;
        padding:24px;
        text-align:center;
      ">
        <img
          src="http://localhost:5173/src/assets/ultimateLogo.svg"
          alt="Ultimate Bliss"
        />
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <h2 style="
          margin:0 0 12px;
          color:#2d2d2d;
          font-size:20px;
        ">
          ${title}
        </h2>

        <p style="
          margin:0;
          color:#555;
          font-size:15px;
          line-height:1.6;
        ">
          ${message}
        </p>
      </div>

      <!-- Footer -->
      <div style="
        padding:16px;
        text-align:center;
        font-size:12px;
        color:#999;
        background:#fafafa;
      ">
        © ${new Date().getFullYear()} Ultimate Bliss · All rights reserved
      </div>
    </div>
  </div>
  `;
}
