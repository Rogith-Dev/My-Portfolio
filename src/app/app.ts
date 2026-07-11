import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Link = { label: string; href: string };
type ServiceCard = { title: string; description: string[] };
type Project = { title: string; description: string; href: string };
type ContactLink = { label: string; value: string; href: string; icon: string };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly navLinks: Link[] = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact', href: '#contact' }
  ];

  protected readonly heroTitle = 'Hi, I am Rogith T';
  protected readonly heroSubtitle =
    'I am a Angular Full Stack web developer building fast, usable, and scalable applications with modern technologies.';

  protected readonly aboutText = [
    "I'm an Angular Full Stack Developer with 4+ years of experience building scalable, high-performance web applications. I specialize in developing responsive, user-friendly interfaces with Angular and creating robust backend services using Node.js, Express.js, and MongoDB.",
    'I enjoy solving real-world problems by building clean, reusable, and maintainable applications. From designing REST APIs and managing application state with NgRx/RxJS to optimizing performance and working with large datasets, I focus on delivering efficient solutions that provide a great user experience.',
    "I'm passionate about continuously learning new technologies, exploring AI - assisted development, and writing code that is scalable, maintainable, and production - ready."
  ];

  protected readonly techStack = [
    'Angular',
    'TypeScript',
    'Javascript',
    'HTML',
    'CSS',
    'Sass',
    'Tailwind CSS',
    'Bootstrap',
    'Node.js',
    'Express',
    'Postman',
    'React Native',
    'MongoDB',
    'MySQL',
    'Firebase',
    'Git'
  ];

  protected readonly services: ServiceCard[] = [
    {
      title: 'Front End Development',
      description: [
        'Angular Application Development',
        'Responsive UI Development',
        'Single Page Applications (SPA)',
        'Angular Material & Tailwind CSS',
        'Reactive Forms',
        'State Management (NgRx & RxJS)'
      ]
    },
    {
      title: 'Back End Development',
      description: [
        'Node.js & Express.js',
        'REST API Development',
        'JWT Authentication',
        'Middleware Development',
        'MongoDB Integration',
        'CRUD Operations'
      ]
    },
    {
      title: 'Database Design & Optimization',
      description: [
        'MongoDB Database Design',
        'Aggregation Pipelines',
        'Query Optimization',
        'Data Modeling'
      ]
    }
  ];

  protected readonly projects: Project[] = [
    {
      title: 'Portfolio Website',
      description: 'A modern portfolio website built to showcase skills, services, and contact details.',
      href: '#'
    },
    {
      title: 'SaaS App UI',
      description:
        'A polished dashboard and landing page design for a startup SaaS product with clean information hierarchy.',
      href: '#'
    }
  ];

  protected readonly contactLinks: ContactLink[] = [
    {
      label: 'Email',
      value: 'tdrrohit@gmail.com',
      href: 'mailto:tdrrohit@gmail.com',
      icon: '✉️'
    },
    {
      label: 'Phone',
      value: '+91 81245 51829',
      href: 'tel:+918124551829',
      icon: '📞'
    },
    {
      label: 'LinkedIn',
      value: 'linkedin.com/in/rogith-t',
      href: 'https://www.linkedin.com/in/rogith-t',
      icon: '💼'
    },
    {
      label: 'GitHub',
      value: 'github.com/Rogith-Dev',
      href: 'https://github.com/Rogith-Dev',
      icon: '🐙'
    }
  ];
}
