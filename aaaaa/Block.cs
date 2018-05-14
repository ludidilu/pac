using System;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;


public class Block : MonoBehaviour, IPointerClickHandler
{
    private int pos;

    private bool isVertical;

    private Image img;

    private Func<int, bool, bool> callBack;

    public void Init(int _pos, bool _isVertical, Image _img, Func<int, bool, bool> _callBack)
    {
        pos = _pos;

        isVertical = _isVertical;

        img = _img;

        callBack = _callBack;

        img.color = new Color(1, 1, 1, 0);
    }

    public void SetVisible(bool _b)
    {
        img.color = _b ? Color.red : new Color(1, 1, 1, 0);
    }

    public void OnPointerClick(PointerEventData _data)
    {
        bool b = callBack(pos, isVertical);

        SetVisible(b);
    }
}
