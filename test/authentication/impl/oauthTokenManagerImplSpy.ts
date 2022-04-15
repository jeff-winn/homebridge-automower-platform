import { OAuthTokenManagerImpl } from '../../../src/authentication/impl/oauthTokenManagerImpl';
import { OAuthToken } from '../../../src/clients/model';

export class OAuthTokenManagerImplSpy extends OAuthTokenManagerImpl {
    loggedIn = false;
    refreshed = false;
    overrideInvalidated?: boolean;

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

    public unsafeRefreshToken(): Promise<OAuthToken> {
        return super.doRefreshToken();
    }

    public unsafeSetCurrentToken(token: OAuthToken | undefined) {
        super.unsafeSetCurrentToken(token);
    }

    public unsafeGetCurrentToken(): OAuthToken | undefined {
        return super.unsafeGetCurrentToken();
    }
}