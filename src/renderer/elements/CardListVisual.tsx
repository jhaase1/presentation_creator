import React, { Component } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CardVisual from './CardVisual';
import StateManager from '../types/StateManager';
import Card from '../types/Card';

interface CardListVisualState {
  cards: Card[];
  windowHeight: number;
}

class CardListVisual extends Component<{}, CardListVisualState> {
  private stateManager: StateManager;

  constructor(props: {}) {
    super(props);
    this.stateManager = StateManager.getInstance();
    this.state = {
      cards: this.stateManager.getCards(),
      windowHeight: window.innerHeight,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.stateManager.onFileChange(this.updateCards);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    this.stateManager.offFileChange(this.updateCards);
  }

  handleResize = () => {
    this.setState({ windowHeight: window.innerHeight });
  };

  updateCards = () => {
    this.setState({ cards: this.stateManager.getCards() });
  };

  renderCards() {
    const { cards, windowHeight } = this.state;
    const buttonHeight = 60;

    return (
      <DndProvider backend={HTML5Backend}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            maxHeight: `${windowHeight - 4 * buttonHeight}px`,
          }}
        >
          {cards.map((card, index) => (
            <CardVisual
              key={card.id}
              card={card}
              index={index}
              moveCard={this.stateManager.moveCard}
              deleteCard={this.stateManager.deleteCard}
            />
          ))}
        </div>
      </DndProvider>
    );
  }

  render() {
    return (
      <div>
        {this.renderCards()}
        <div style={{ display: 'flex', gap: '10px', padding: '10px' }}>
          <button
            type="button"
            onClick={() => this.stateManager.addCard()}
            style={{ flex: 1 }}
          >
            Add Card
          </button>
          <button
            type="button"
            onClick={() => {
              for (let i = 0; i < 10; i += 1) {
                this.stateManager.addCard();
              }
            }}
            style={{ flex: 1 }}
          >
            Add 10 Cards
          </button>
        </div>
      </div>
    );
  }
}

export default CardListVisual;
