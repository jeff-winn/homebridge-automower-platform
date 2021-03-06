import { OAuthToken } from '../../../src/clients/authenticationClient';
import { AccessTokenManagerImpl } from '../../../src/services/husqvarna/accessTokenManager';

export class AccessTokenManagerImplSpy extends AccessTokenManagerImpl {
    public loggedIn = false;
    public refreshed = false;
    public overrideInvalidated?: boolean;

    protected override async doLogin(): Promise<OAuthToken> {
        const token = await super.doLogin();

        this.loggedIn = true;
        return token;
    }

    protected async doRefreshToken(): Promise<OAuthToken> {
        const token = await super.doRefreshToken();

        this.refreshed = true;
        return token;
    }

    public unsafeSetExpiration(token: OAuthToken): void {
        super.setExpiration(token);
    }

    public setTokenInvalidedOverride(value: boolean): void {
        this.overrideInvalidated = value;
    }

    protected isTokenInvalidated(): boolean {
        if (this.overrideInvalidated !== undefined) {
            return this.overrideInvalidated;
        }

        return super.isTokenInvalidated();
    }

    public unsafeDoLogin(): Promise<OAuthToken> {
        return super.doLogin();
    }

    public unsafeRefreshToken(): Promise<OAuthToken> {
        return super.doRefreshToken();
    }

    public unsafeSetCurrentToken(token: OAuthToken | undefined) {
        super.unsafeSetCurrentToken(token);
    }

    public unsafeGetCurrentToken(): OAuthToken | undefined {
        return super.unsafeGetCurrentToken();
    }

    public unsafeResetToken(): void {
        this.resetToken();
    }

    public unsafeGetRequiredCurrentToken(): OAuthToken {
        return this.getRequiredCurrentToken();
    }
}