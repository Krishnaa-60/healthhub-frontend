document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            
            console.log('Form submitted:', {
                name: name,
                email: formData.get('email'),
                message: formData.get('message'),
            });

            alert(`Thank you, ${name}. Your message has been received.`);
            contactForm.reset();
        });
    }
});