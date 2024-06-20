import { html } from "lit-html";
import styles from './guestHome.scss';

export const guestHomeTemplate = () => html`

<div class=${styles['container']}>
    <p class=${styles['welcome-title']}>Welcome to Instill Flow</p>
    <p class=${styles['welcome-banner']}>Your personalised inventory manager</p>
</div>
`