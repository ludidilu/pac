using System.Collections.Generic;
using System.IO;
using UnityEngine;
using LitJson;
using UnityEngine.UI;
using UnityEditor;

public class NewBehaviourScript : MonoBehaviour
{
    private const int totalMapWidth = 500;

    private const float obstacleWidthFix = 0.2f;

    public RectTransform container;

    public RectTransform obstacleContainer;

    public InputField widthInput;

    public InputField heightInput;

    public GameObject confirmWidthAndHeightPanel;

    private int mapWidth;

    private int mapHeight;

    private Dictionary<int, bool> vDic = new Dictionary<int, bool>();

    private Dictionary<int, bool> hDic = new Dictionary<int, bool>();

    private Dictionary<int, GameObject> mapDic = new Dictionary<int, GameObject>();

    private Dictionary<int, Block> vBlock = new Dictionary<int, Block>();

    private Dictionary<int, Block> hBlock = new Dictionary<int, Block>();

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
                int id = i * mapWidth + m;

                GameObject go = new GameObject();

                mapDic.Add(id, go);

                Image img = go.AddComponent<Image>();

                img.raycastTarget = false;

                go.transform.SetParent(container, false);

                img.rectTransform.sizeDelta = new Vector2(unitWidth, unitWidth);

                img.rectTransform.pivot = new Vector2(0, 1);

                img.rectTransform.anchoredPosition = new Vector2(m * unitWidth, i * -unitWidth);

                if (i % 2 == m % 2)
                {
                    img.color = Color.gray;
                }

                if (i < mapHeight - 1)
                {
                    GameObject obstacle = new GameObject();

                    img = obstacle.AddComponent<Image>();

                    img.color = Color.red;

                    obstacle.transform.SetParent(obstacleContainer, false);

                    img.rectTransform.sizeDelta = new Vector2(unitWidth, unitWidth * obstacleWidthFix);

                    img.rectTransform.pivot = new Vector2(0, 1);

                    img.rectTransform.anchoredPosition = new Vector2(m * unitWidth, i * -unitWidth - unitWidth + 0.5f * unitWidth * obstacleWidthFix);

                    Block block = obstacle.AddComponent<Block>();

                    block.Init(id, true, img, Click);

                    vBlock.Add(id, block);

                    block.SetVisible(vDic.ContainsKey(id));
                }

                if (m < mapWidth - 1)
                {
                    GameObject obstacle = new GameObject();

                    img = obstacle.AddComponent<Image>();

                    img.color = Color.red;

                    obstacle.transform.SetParent(obstacleContainer, false);

                    img.rectTransform.sizeDelta = new Vector2(unitWidth * obstacleWidthFix, unitWidth);

                    img.rectTransform.pivot = new Vector2(0, 1);

                    img.rectTransform.anchoredPosition = new Vector2(m * unitWidth + unitWidth - 0.5f * unitWidth * obstacleWidthFix, i * -unitWidth);

                    Block block = obstacle.AddComponent<Block>();

                    block.Init(id, false, img, Click);

                    hBlock.Add(id, block);

                    block.SetVisible(hDic.ContainsKey(id));
                }
            }
        }

        container.anchoredPosition = new Vector2(-0.5f * totalMapWidth, 0.5f * totalMapWidth);

        obstacleContainer.anchoredPosition = new Vector2(-0.5f * totalMapWidth, 0.5f * totalMapWidth);
    }

    private bool Click(int _pos, bool _isVertical)
    {
        Dictionary<int, bool> dic = _isVertical ? vDic : hDic;

        if (dic.ContainsKey(_pos))
        {
            dic.Remove(_pos);

            return false;
        }
        else
        {
            dic.Add(_pos, true);

            return true;
        }
    }

    public void Save()
    {
        JSONClass result = new JSONClass();

        result.Add("mapWidth", new JSONData(mapWidth));

        result.Add("mapHeight", new JSONData(mapHeight));

        JSONClass vNode = new JSONClass();

        JSONClass hNode = new JSONClass();

        result.Add("v", vNode);

        result.Add("h", hNode);

        IEnumerator<int> enumerator = vDic.Keys.GetEnumerator();

        while (enumerator.MoveNext())
        {
            vNode.Add(enumerator.Current.ToString(), new JSONData(enumerator.Current));
        }

        enumerator = hDic.Keys.GetEnumerator();

        while (enumerator.MoveNext())
        {
            hNode.Add(enumerator.Current.ToString(), new JSONData(enumerator.Current));
        }

        string path = EditorUtility.SaveFilePanel("a", Application.dataPath, "", "map");

        if (!string.IsNullOrEmpty(path))
        {
            FileInfo fi = new FileInfo(path);

            if (fi.Exists)
            {
                fi.Delete();
            }

            using (FileStream fs = fi.Create())
            {
                using (StreamWriter sw = new StreamWriter(fs))
                {
                    sw.Write(result.ToString());
                }
            }
        }
    }

    public void Load()
    {
        string path = EditorUtility.OpenFilePanel("a", Application.dataPath, "map");

        if (!string.IsNullOrEmpty(path))
        {
            using (FileStream fs = new FileStream(path, FileMode.Open))
            {
                using (StreamReader sr = new StreamReader(fs))
                {
                    string str = sr.ReadToEnd();

                    Load(str);
                }
            }
        }
    }

    private void Load(string _str)
    {
        Clear();

        JSONClass result = JSONNode.Parse(_str) as JSONClass;

        mapWidth = result["mapWidth"].AsInt;

        mapHeight = result["mapHeight"].AsInt;

        JSONClass vNode = result["v"] as JSONClass;

        JSONClass hNode = result["h"] as JSONClass;

        IEnumerator<KeyValuePair<string, JSONNode>> ee = vNode.GetEnumeratorReal();

        while (ee.MoveNext())
        {
            vDic.Add(int.Parse(ee.Current.Key), true);
        }

        ee = hNode.GetEnumeratorReal();

        while (ee.MoveNext())
        {
            hDic.Add(int.Parse(ee.Current.Key), true);
        }

        Create();
    }

    private void Clear()
    {
        vDic.Clear();

        hDic.Clear();

        IEnumerator<GameObject> ee = mapDic.Values.GetEnumerator();

        while (ee.MoveNext())
        {
            Destroy(ee.Current);
        }

        mapDic.Clear();

        IEnumerator<Block> ee2 = vBlock.Values.GetEnumerator();

        while (ee2.MoveNext())
        {
            Destroy(ee2.Current.gameObject);
        }

        vBlock.Clear();

        ee2 = hBlock.Values.GetEnumerator();

        while (ee2.MoveNext())
        {
            Destroy(ee2.Current.gameObject);
        }

        hBlock.Clear();
    }
}
