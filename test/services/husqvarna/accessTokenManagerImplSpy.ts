import { OAuthToken } from '../../../src/clients/authenticationClient';
import { AccessTokenManagerImpl } from '../../../src/services/husqvarna/accessTokenManager';

export class AccessTokenManagerImplSpy extends AccessTokenManagerImpl {
    public loggedIn = false;
    public refreshed = false;
    public overrideInvalidated?: boolean;

    protected override async doLoginAsync(): Promise<OAuthToken> {
        const token = await super.doLoginAsync();

        this.loggedIn = true;
        return token;
    }

    protected async doRefreshTokenAsync(): Promise<OAuthToken> {
        const token = await super.doRefreshTokenAsync();

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

    public unsafeDoLoginAsync(): Promise<OAuthToken> {
        return super.doLoginAsync();
    }

    public unsafeRefreshTokenAsync(): Promise<OAuthToken> {
        return super.doRefreshTokenAsync();
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