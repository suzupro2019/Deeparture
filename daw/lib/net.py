# coding: utf-8

import chainer
import chainer.functions as F
import chainer.links as L


class ChordNet(chainer.Chain):
    def __init__(self, n_vocab, n_units):
        super(ChordNet, self).__init__()
        with self.init_scope():
            self.embed = L.EmbedID(n_vocab, n_units, ignore_label=-1)
            self.l1 = L.LSTM(n_units, n_units)
            self.l2 = L.LSTM(n_units, n_units)
            self.l3 = L.LSTM(n_units, n_units)
            self.l4 = L.Linear(n_units, n_vocab)

    def __call__(self, x):
        h = self.embed(x)
        h = self.l1(F.dropout(h))
        h = self.l2(F.dropout(h))
        h = self.l3(F.dropout(h))
        h = self.l4(F.dropout(h))
        return h

    def reset_state(self):
        self.l1.reset_state()
        self.l2.reset_state()
        self.l3.reset_state()
