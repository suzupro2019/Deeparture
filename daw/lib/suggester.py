# coding: utf-8
# 分数コードありバージョン

import numpy as np
import chainer
import chainer.functions as F
from chainer import Variable

from .net import ChordNet

from pychord import Chord
from pychord.analyzer import notes_to_positions
from pychord.constants import QUALITY_DICT as QD
from pychord.utils import note_to_val

from .constants import major_keys, minor_keys, minor_major_keys, artists

import pickle


# QUALITY_DICT optimization
# REVIEW: chord-suggesterで出されるコードは一応対応のはず
# NOTE: 可能であれば全てのコードのパターンを網羅できると良い
# FIXME: QUALITY_DICTは直にいじるべきではないかも
QD['dim7'] = QD.pop('dim6')
QD['φ'] = QD['m7-5']
QD['7aug'] = QD['7+5']


_BOS = "<s>"  # $BOS = 文頭、EOS=文末
_EOS = "</s>"
_MAX_LEN = 4  # デフォルト16


def sample(preds, temperature=1.0):
    preds = np.asarray(preds).astype("float64")
    preds = np.log(preds) / temperature
    exp_preds = np.exp(preds)
    preds = exp_preds / np.sum(exp_preds)
    probas = np.random.multinomial(1, preds, 1)
    return np.argmax(probas)


def generate_chord_prog(artist, key, start=None):
    """ Generate chord progression

    :param str artist: name of artist
    :param str key: key scale
    :param str start: chords what chord progression start with
    :rtype: str
    :return: chord progression
    """

    if key in major_keys:
        ks = key
    elif key in minor_keys:
        ks = minor_major_keys.get(key)
    else:
        ks = "C"

    model_path = "daw/lib/models/chordnet.model"
    if artists.get(artist):
        model_path = model_path.replace('chordnet', artists.get(artist))

    n_unit = 256

    # ファイル化したコード辞書をロードする
    c2i_path = 'daw/lib/dicts/chordnet_c2i.pkl'
    i2c_path = 'daw/lib/dicts/chordnet_i2c.pkl'
    if artists.get(artist):
        c2i_path = c2i_path.replace('chordnet', artists.get(artist))
        i2c_path = i2c_path.replace('chordnet', artists.get(artist))
    with open(c2i_path, 'rb') as f:
        c2i = pickle.load(f)
    with open(i2c_path, 'rb') as f:
        i2c = pickle.load(f)

    eos_id = c2i[_EOS]
    model = ChordNet(len(c2i), n_unit)

    chainer.serializers.load_npz(model_path, model)

    sChArr = []
    if start:
        for ch in start.split(" "):
            try:
                sChord = Chord(ch)
                sChord.transpose(12 - note_to_val(ks), ks)
            except ValueError:
                pass
            sChArr.append(sChord.chord)

    while True:
        s = _BOS + " " + " ".join(sChArr)
        chord_ids = [c2i[ch] for ch in s.strip().split(" ")]

        with chainer.using_config("train", False):
            model.reset_state()

            for chord_id in chord_ids[:-1]:
                xs = Variable(np.array([chord_id], dtype=np.int32))
                model(xs)

            for i in range(_MAX_LEN):
                xs = Variable(np.array([chord_ids[-1]], dtype=np.int32))
                cid = sample(F.softmax(model(xs))[0].data)
                # cid = np.argmax(F.softmax(model(xs))[0].data)

                if cid == eos_id:
                    break

                chord_ids.append(cid)

        # print(' '.join([i2c[cid] for cid in chord_ids[1:]]))

        chords = []
        for cid in chord_ids[1:]:
            try:
                ch = Chord(i2c[cid])
                ch.transpose(note_to_val(ks), ks)
                chords.append(ch.chord)
            except ValueError:
                break
        if len(chords) == _MAX_LEN:
            break
        elif len(chords) >= _MAX_LEN:
            chords = chords[:_MAX_LEN]
            break

    return " ".join(chords)
