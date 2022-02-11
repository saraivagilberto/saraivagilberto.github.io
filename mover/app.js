import { registerObserver } from './db.js';
'use strict';

export class StockPosition extends React.Component {
  render() {
    if (this.props.position.data.state == 0) {

      return '';

    } else if (this.props.position.data.state == 2) {

      const color = this.props.position.data.hold >= this.props.position.data.curr ? 'red' : 'green';

      const online = {
        hold: this.props.position.data.hold.toFixed(8),
        target: this.props.position.data.target.toFixed(8),
        curr: this.props.position.data.curr.toFixed(8),
      }

      online['perc'] = (((online.curr - online.hold) / online.hold) * 100.000000).toFixed(2)

      const lastData = {
        hold: this.props.position.last?.hold.toFixed(8),
        target: this.props.position.last?.target.toFixed(8),
        curr: this.props.position.last?.curr.toFixed(8),
      }
      lastData['perc'] = (((lastData.curr - lastData.hold) / lastData.hold) * 100.000000).toFixed(2)

      return React.createElement(
        'div',
        { className: 'my-1 border border-' + color + '-600 text-right' },
        [
          React.createElement(
            'div',
            { className: 'grid grid-cols-3' },
            [
              React.createElement(
                'div',
                { className: 'text-left font-bold italic p-2 pt-4' },
                [
                  this.props.position.target + '/' + this.props.position.source,
                ]
              ),
              React.createElement(
                'div',
                { },
                [
                  React.createElement(
                    'sub',
                    { },
                    [
                      online.target
                    ]
                  ),
                  React.createElement(
                    'div',
                    { className: '' },
                    [
                      online.hold,
                    ]
                  ),
                  React.createElement(
                    'sup',
                    { },
                    [
                      online.curr
                    ]
                  )
                ]
              ),
              React.createElement(
                'div',
                { className: 'text-base text-' + color + '-600 font-bold p-2 pt-3' },
                [
                  online.perc,
                  '%'
                ]
              )
            ]
          )
        ]
      );

    } else {

      const color = ['gray', 'red', 'green', 'blue'][this.props.position.data.state]
      return React.createElement(
        'div',
        { className: 'p-1 border border-' + color + '-600 text-right' },
        [
          React.createElement(
            'div',
            { className: 'text-base font-bold' },
            [
              this.props.position.target + '/' + this.props.position.source,
            ]
          )
        ]
      );
    }
  }
}

export class Stock extends React.Component {
  render() {
    const positions = [];
    for (const source in this.props.stock.data) {
      if (this.props.stock.data[source].state != 0) {
        positions.push(React.createElement(
          StockPosition,
          { key: 'stockpos_' + this.props.stock.target + '_' + source, position: { source: source, target: this.props.stock.target, data: this.props.stock.data[source], last: this.props.stock.last ? this.props.stock.last[source] : null } }
        ));
      }
    }

    return React.createElement(
      'div',
      { className: 'shadow-md m-3 p-1 rounded-md border-2 border-gray-600' },
      [
        positions
      ]
    );
  }
}

export class StockList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { stocks: {}, last: {} };
  }

  componentDidMount() {
    const curr = this
    registerObserver((data) => {
      const last = this.state.last ?? {}
      Object.keys(data).map((stock) => {
        return Object.keys(data[stock]).map((target) => {
          if (!last[stock]) {
            last[stock] = {}
          }

          if (!last[stock][target]) {
            last[stock][target] = {
              curr: 0,
              hold: 0,
              state: 0,
              target: 0,
              upt: 0,
            }
          }

          Object.keys(data[stock][target]).map((prop) => {
            if (last[stock][target][prop] != data[stock][target][prop]) {
              last[stock][target][prop] = data[stock][target][prop]
            }
          });
        })
      })
      
      curr.setState({ stocks: data, last: last })
    })
  }

  render() {
    const items = [];
    for (const stock in this.state.stocks) {
      let holding = false
      for (const target in this.state.stocks[stock]) {
        if (this.state.stocks[stock][target].state != 0) {
          holding = true;
        }
      }

      if (holding) {
        items.push(React.createElement(
          Stock,
          { key: 'stock_' + stock, stock: { target: stock, data: this.state.stocks[stock], last: this.state.last[stock] } }
        ));
      }
    }

    return React.createElement(
      'div',
      { className: 'grid lg:grid-cols-3 grid-cols-1 p-2 text-xs font-mono' },
      items
    );
  }
}