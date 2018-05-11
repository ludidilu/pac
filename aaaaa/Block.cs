using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;

public class Block : MonoBehaviour, IPointerClickHandler
{
    private int pos;

    private bool isVertical;

    private Action<int, bool> callBack;

    public void Init(int _pos, bool _isVertical, Action<int, bool> _callBack)
    {
        pos = _pos;

        isVertical = _isVertical;

        callBack = _callBack;
    }

    public void OnPointerClick(PointerEventData _data)
    {
        callBack(pos, isVertical);
    }
}
