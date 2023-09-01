import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { WalletService } from 'src/subdomains/user/application/services/wallet.service';
import {
  LnBitsLnurlPayRequestDto,
  LnBitsLnurlpInvoiceDto,
} from '../../../integration/blockchain/lightning/dto/lnbits.dto';
import { LightningClient } from '../../../integration/blockchain/lightning/lightning-client';
import { LightningHelper } from '../../../integration/blockchain/lightning/lightning-helper';
import { LightningService } from '../../../integration/blockchain/lightning/services/lightning.service';

@Injectable()
export class LightningForwardService {
  private readonly client: LightningClient;

  constructor(private readonly walletService: WalletService, lightningService: LightningService) {
    this.client = lightningService.getDefaultClient();
  }

  // --- LNDHUB --- //
  async lndhubRequest(req: Request, body: any, params: any): Promise<any> {
    const lastUrlpart = this.getLastUrlPart(req);
    if (!lastUrlpart) return null;

    return this.client.lndhubRequest({
      method: req.method,
      headers: req.headers,
      lastUrlpart: lastUrlpart,
      body: body,
      params: params,
    });
  }

  // --- Wellknown --- //
  async wellknownForward(address: string, asset?: string): Promise<LnBitsLnurlPayRequestDto> {
    const wallet = await this.walletService.getByLnbitsAddress(address);
    if (!wallet) throw new NotFoundException('Wallet not found');

    asset ??= 'BTC';

    const lighningWallet = wallet.lightningWallets.find((w) => w.asset === asset);
    if (!lighningWallet) throw new NotFoundException('Lightning Wallet not found');

    return this.lnurlpForward(lighningWallet.lnurlpId);
  }

  // --- LNURLp --- //
  async lnurlpForward(id: string): Promise<LnBitsLnurlPayRequestDto> {
    const payRequest = await this.client.getLnurlpPaymentRequest(id);

    payRequest.callback = LightningHelper.createLnurlpCallbackUrl(id);

    return payRequest;
  }

  async lnurlpCallbackForward(id: string, params: any): Promise<LnBitsLnurlpInvoiceDto> {
    return this.client.getLnurlpInvoice(id, params);
  }

  // --- UTILITIES --- //
  private getLastUrlPart(req: Request): string | undefined {
    return req.path.split('/').at(-1);
  }
}
