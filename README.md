### 📌MEAN CRM + eStore + Registration System

Yanbu International (Gulf-based Company Portal)

A complete MEAN Stack CRM + eCommerce + Candidate Registration ecosystem.
Companies (Gulf region) can register, post jobs, and manage profiles.
Candidates can build CVs using the CV Builder (or upload existing ones) and save everything inside their dashboard.

### 🚀 Project Overview

## 🏢 Company Module
 
Gulf-based companies can register & verify their accounts

Post jobs & manage job listings

View & shortlist candidates

Employer dashboard for tracking applicants

## 👨‍💼 Candidate Module

Register & create a complete profile

CV Builder (Create CV using template)

Upload ready-made CVs

Save multiple CV versions

Apply for jobs posted by companies

Candidate dashboard

## 🛒 eStore Module

Showcase products

Add to cart, checkout, orders

Admin product management

## 🧠 CRM Features

Customer management

Leads management

Task assignment

Dashboard analytics

🧩 Architecture
Frontend (Angular)

Angular 16+

Bootstrap + Custom UI

Angular Services for API integration

JWT authentication

Role-based guard system (Company / Candidate / Admin)

Backend (Java Spring Boot)

RESTful API

Authentication & Authorization

File upload (CV / Documents)

MySQL/PostgreSQL DB

DTO + Service + Controller architecture

/src  
 
 ├── app  
 
 │   ├── components  
 
 │   ├── modules  
 
 │   │   ├── company  
 
 │   │   ├── candidate  
 
 │   │   ├── admin  
 
 │   │   └── shared  
 
 │   ├── services  
 
 │   └── guards  
 
 ├── assets  
 
 └── environments  

	
## 🔌 API Integration

Your Angular app is fully integrated with Java backend APIs:

Auth API

Company Management API

Candidate Profile & CV API

Job Posting API

eStore API

Admin Panel API


### 🛠️ Setup Instructions

1️⃣ Install Dependencies

npm install

2️⃣ Run Angular App

ng serve -o

3️⃣ Backend (Java Spring Boot)

mvn spring-boot:run

### 🧪 Testing

Angular Unit Tests → Karma/Jasmine

API Tests → Postman Collection

### 📄 License

This project is licensed under the MIT License.

### 🤝 Authors / Contributors

Muzamil Saleem

Frontend: Angular

Backend: Java Spring Boot
	
