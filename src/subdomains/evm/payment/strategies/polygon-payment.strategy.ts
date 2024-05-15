import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Config } from 'src/config/config';
import { Blockchain } from 'src/shared/enums/blockchain.enum';
import { EvmPaymentStrategy } from './common/evm-payment.strategy';

@Injectable()
export class PolygonPaymentStrategy extends EvmPaymentStrategy implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  onModuleInit() {
    super.onModuleInit();
  }

  onModuleDestroy() {
    super.onModuleDestroy();
  }

  get blockchain(): Blockchain {
    return Blockchain.POLYGON;
  }

  //*** HELPER METHODS ***//

  get ownAddress(): string {
    return Config.blockchain.polygon.walletAddress;
  }
}
