import React, { Component } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CardVisual from './CardVisual';
import CardManager from '../../types/CardManager';
import Card from '../../types/Card';

interface CardListVisualState {
  cards: Card[];
  windowHeight: number;
}

class CardListVisual extends Component<{}, CardListVisualState> {
  private cardManager: CardManager;

  constructor(props: {}) {
    super(props);
    this.cardManager = CardManager.getInstance();
    this.state = {
      cards: this.cardManager.getCards(),
      windowHeight: window.innerHeight,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.cardManager.addListener(this.updateCards);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    this.cardManager.removeListener(this.updateCards);
  }

  handleResize = () => {
    this.setState({ windowHeight: window.innerHeight });
  };

  updateCards = () => {
    this.setState({ cards: this.cardManager.getCards() });
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
              setFile={this.cardManager.setFile}
              setUseSidebar={this.cardManager.setUseSidebar}
              setBlankSlide={this.cardManager.setBlankSlide}
              moveCard={this.cardManager.moveCard}
              deleteCard={this.cardManager.deleteCard}
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
        <button type="button" onClick={() => this.cardManager.addCard()}>
          Add Additional Element
        </button>
      </div>
    );
  }
}

export default CardListVisual;
