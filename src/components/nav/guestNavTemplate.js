import { html } from "lit-html";
import styles from './guestNav.module.scss';

export const guestNavTemplate = (dropDown) => html`
<div class=${styles['guest-nav-container']}>
<a class=${styles['title']} href="/">Instill Flow</a>
<div class=${styles['link-container']}>
    <a href="/login">Login</a>
    <a href="/register">Register</a>
</div>
</div>
`;