import React from 'react';
import { Container } from 'react-bootstrap';
import { FaGithub, FaReact, FaPhp, FaDatabase, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer mt-auto py-3">
        <Container className="text-center">
            <span className="text-muted">
            Desarrollado con 💙 por Victor Vargas Diaz
            </span>
            <div className="social-icons mt-2">
            <a href="https://github.com/INGVictorVargas-Dev-1907" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub size={24} className="mx-2" />
            </a>
            <a href="https://www.linkedin.com/in/victor-alfonso-𝚅𝚊𝚛𝚐𝚊𝚜-diaz-6b853a355" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin size={24} className="mx-2" />
            </a>
            </div>
            <div className="tech-stack mt-2">
            <small className="text-muted">
                Tecnologías:
                <FaReact color="#61DAFB" className="mx-1" title="React.js" size={20} />
                <FaPhp color="#777bb4" className="mx-1" title="PHP" size={23} />
                <FaDatabase color="#4169E1" className="mx-1" title="PostgreSQL" size={20} />
            </small>
            </div>
        </Container>
        </footer>
    );
};

export default Footer;