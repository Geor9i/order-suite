import { html } from "lit-html";
import styles from './nav.module.css';

export const guestNavTemplate = (dropDown) => html`
<div class=${styles['guest-nav-container']}>
<a class=${styles['title']} href="/">Instill Flow</a>
<div class=${styles['link-container']}>
    <a class=${styles['link']} href="/login">Login</a>
    <a class=${styles['link']} href="/register">Register</a>
</div>
</div>
`;