import type { Deck } from "../../../shared/deck";
import type { CompressionStrategy } from "./types";

class CompressionManager {
  private readonly strategies = new Map<string, CompressionStrategy>();

  register(strategy: CompressionStrategy): void {
    if (this.strategies.has(strategy.id)) {
      throw new Error(
        `Compression strategy "${strategy.id}" is already registered.`
      );
    }

    this.strategies.set(strategy.id, strategy);
  }

  get(id: string): CompressionStrategy {
    const strategy = this.strategies.get(id);

    if (!strategy) {
      throw new Error(`Unknown compression strategy "${id}".`);
    }

    return strategy;
  }

  async encode(
    deck: Deck,
    preferred = "single"
  ): Promise<{
    strategy: string;
    data: string;
  }> {
    const strategy = this.get(preferred);

    if (!strategy.canEncode(deck)) {
      throw new Error(
        `Compression strategy "${preferred}" cannot encode this deck.`
      );
    }

    return {
      strategy: strategy.id,
      data: await strategy.encode(deck),
    };
  }

  async decode(
    strategyId: string,
    data: string
  ): Promise<Deck> {
    return this.get(strategyId).decode(data);
  }
}

export const Compression = new CompressionManager();
