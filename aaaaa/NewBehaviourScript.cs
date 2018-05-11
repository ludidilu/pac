using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using UnityEngine;
using Google.Protobuf;
using System;
using LitJson;
using UnityEngine.UI;

public class NewBehaviourScript : MonoBehaviour
{
    private const int totalMapWidth = 500;

    public RectTransform container;

    public InputField widthInput;

    public InputField heightInput;

    public GameObject confirmWidthAndHeightPanel;

    private int mapWidth;

    private int mapHeight;

    void Start()
    {


    }

    public void ConfirmWidthAndHeight()
    {
        confirmWidthAndHeightPanel.SetActive(false);

        mapWidth = int.Parse(widthInput.text);

        mapHeight = int.Parse(heightInput.text);

        Create();
    }

    private void Create()
    {
        float unitWidth = totalMapWidth / mapWidth;

        for (int i = 0; i < mapHeight; i++)
        {
            for (int m = 0; m < mapWidth; m++)
            {
                GameObject go = new GameObject();

                Image img = go.AddComponent<Image>();

                go.transform.SetParent(container, false);

                img.rectTransform.sizeDelta = new Vector2(unitWidth, unitWidth);

                img.rectTransform.pivot = new Vector2(0, 1);

                img.rectTransform.anchoredPosition = new Vector2(m * unitWidth, i * -unitWidth);

                if (i % 2 == m % 2)
                {
                    img.color = Color.gray;
                }
            }
        }

        container.anchoredPosition = new Vector2(-0.5f * totalMapWidth, 0.5f * totalMapWidth);
    }

    // Update is called once per frame
    void Update()
    {

    }
}
