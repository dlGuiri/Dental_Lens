# 🦷 Dental Lens User Manual

**DentalLens** is a web-based application that allows users to perform AI-assisted oral health assessments by uploading a photo of their mouth. The system uses machine learning to detect common dental issues and provide personalized health tips.

---

## ✅ Features

- 📷 **Image Upload**: Upload mouth photos for instant analysis.
- 🤖 **AI-Powered Diagnosis**: Detects 6 common dental conditions using CNN (InceptionV3).
- 💬 **Chatbot Assistant**: Ask questions and receive dental hygiene tips.
- 📅 **Calendar Tracker**: Log brushing, flossing, and dental appointments.
- 🎥 **Video Recommendations**: Watch tips based on scan results.
- 🧾 **Scan Records**: View past scan results and progress.

---

## 🔁 How It Works

1. **User uploads a mouth photo** via the web app.
2. The image is **preprocessed** and sent to a REST API backend.
3. The **AI model (InceptionV3)** analyzes the image.
4. Prediction results are returned and shown to the user.
5. Relevant video tips and chatbot suggestions are generated.
6. All data is stored securely via **MongoDB** with **Mongoose**.

---

## 🖱 How to Use

1. **Go to the web app** URL (e.g., `https://dentallens.app`).
2. **Sign up or log in** to access your dashboard.
3. **Click “Scan”** and upload a clear image of your teeth/mouth.
4. **Wait for the result** — prediction and tips will be shown.
5. **Chat with the AI bot** for guidance or questions.
6. **Track your activities** using the calendar feature.

---

## 📌 Tips for Better Scans

- Take the photo in **bright light**.
- Keep your mouth **open wide** to show teeth clearly.
- Avoid blurry or dark photos.
- Do **not use camera filters** or flash reflections.
- Use the **recommended angle** shown on the scan page.

---

## 🔐 Data Privacy

- All uploaded images and scan data are **securely stored**.
- User data is handled in compliance with data privacy best practices.
- Only **authorized users** can view their records.

---

## 🚧 Planned Improvements

- 🧑‍⚕️ **Dentist Interface**: Allow professionals to view scans and provide expert feedback.
- 🦠 **Expanded Detection**: Add more than the initial six oral diseases.
- 📞 **Live Consultations**: Integrate with dental clinics for remote appointments.
- 🔔 **Push Notifications**: Reminders for scans or brushing schedules.

---

## 📷 Screenshots
![Image](https://github.com/user-attachments/assets/a1124ad0-fb6d-4329-8037-d3a401b5a150)

![Image](https://github.com/user-attachments/assets/6f6bfff0-420c-43d6-964a-af446fae5d3d)

![Image](https://github.com/user-attachments/assets/9446a245-b18d-4cae-a844-af51e4ce02ef)

![Image](https://github.com/user-attachments/assets/b63bf143-d38b-4921-9940-8ca3b3d1a65d)

![Image](https://github.com/user-attachments/assets/b9487a03-152b-458e-970b-ef85e8f69930)

DentalLens is designed to make oral health care more accessible — especially for communities without regular access to dental services. 🦷💙

