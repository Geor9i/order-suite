import { html } from "lit-html";
import styles from './loginPage.module.scss'

export const loginPageTemplate = (submitHandler) => html`
 <div class=${styles['login-container']}>
        <form @submit=${submitHandler} class=${styles['login-form']}>
          <div class=${styles['input-container']}>
            <label class=${styles['label']} for="username">Email</label>
            <input type="text" name="email" />
          </div>
          <div class=${styles['input-container']}>
            <label class=${styles['label']} for="password">Password</label>
            <input type="password" name="password" />
          </div>
          <button class=${styles['submit-btn']}>Login</button>
        </form>
      </div>`